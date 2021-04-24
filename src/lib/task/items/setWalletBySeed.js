import database from '@/db';
import {handleException, handleExceptionCodes} from '@/lib/task/exception/handleException';
import wallet from "@/lib/wallet";
import tonLib from "@/api/tonSdk";
import {paramRepository} from "@/db/repository/paramRepository";
import keystoreLib from "@/lib/keystore";
import keystoreException from "@/lib/keystore/keystoreException";

export default {
  name: 'setWalletBySeed',
  errorCodes: {
    invalidSeed: 10,
  },
  handle: async function (task) {
    const {seed, contractId, isRestoring, pass} = task.data;
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;
    const currentPassHash = await paramRepository.getParam('pass');
    const isPasswordSet = null !== currentPassHash;
    const passHash = await tonLib.sha256(server, pass);
    if (isPasswordSet && currentPassHash !== passHash) {
      throw new keystoreException('Invalid password');
    }

    let keys = null;
    try {
      keys = await tonLib.convertSeedToKeys(server, seed);
    } catch (err) {
      if (err.code === 2017) {
        throw new handleException(handleExceptionCodes.invalidSeed.code);
      } else {
        throw err;
      }
    }
    const encryptedKeys = await keystoreLib.encrypt(server, keys, pass);

    if (!isPasswordSet) {
      await paramRepository.createOrUpdate('pass', passHash);
    }

    await wallet.restore(server, contractId, encryptedKeys, isRestoring);
  }
}
