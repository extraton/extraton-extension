import TonApi from '@/api/ton';
import database from '@/db';
import {handleException, handleExceptionCodes} from '@/lib/task/exception/handleException';
import wallet from "@/lib/wallet";

export default {
  name: 'setWalletBySeed',
  errorCodes: {
    invalidSeed: 10,
  },
  handle: async function (task) {
    const {seed, contractId, isRestoring} = task.data;
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;
    let keys = null;
    try {
      keys = await TonApi.convertSeedToKeys(server, seed);
    } catch (err) {
      if (err.code === 2017) {
        throw new handleException(handleExceptionCodes.invalidSeed.code);
      } else {
        throw err;
      }
    }

    await wallet.restore(server, contractId, keys, isRestoring);
  }
}
