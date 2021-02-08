import tonSdkLib from "@/api/tonSdk";
import database from "@/db";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";

export default {
  name: 'encryptKeys',
  handle: async function (task) {
    const {data, dataType, password} = task.data;
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;

    let keys;
    if (dataType === 1) {
      keys = await tonSdkLib.convertSeedToKeys(server, data);
    } else if (dataType === 2) {
      keys = data;
    } else {
      throw new handleException(handleExceptionCodes.unknownKeyType.code);
    }

    const chacha20 = await tonSdkLib.chacha20Encrypt(server, keys.secret, password);
    return {
      version: 1,
      public: keys.public,
      Crypto: {
        cipher: 'chacha20',
        cipherparams: {nonce: chacha20.nonce},
        ciphertext: chacha20.data,
      }
    };
  }
}
