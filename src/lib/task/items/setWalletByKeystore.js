import database from "@/db";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import wallet from "@/lib/wallet";
import keystoreLib from "@/lib/keystore";
import keystoreException from "@/lib/keystore/keystoreException";
import {paramRepository} from "@/db/repository/paramRepository";
import {routes} from "@/plugins/router";

export default {
  name: 'setWalletByKeystore',
  handle: async function (task) {
    const {file, password, contractId, isRestoring} = task.data;
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;

    let keystore;
    try {
      keystore = JSON.parse(file);
    } catch (e) {
      throw new handleException(handleExceptionCodes.invalidKeystoreFile.code);
    }

    try {
      await keystoreLib.decrypt(server, keystore, password);
    } catch (e) {
      if (e instanceof keystoreException) {
        throw new handleException(handleExceptionCodes.keystore.code, e.message);
      } else {
        throw e;
      }
    }

    await wallet.restore(server, contractId, keystore, isRestoring);
    await paramRepository.createOrUpdate('page', {name: routes.wallet});
  }
}
