import TonApi from '@/api/ton';
import database from '@/db';
import {handleException, handleExceptionCodes} from '@/lib/task/exception/handleException';
const setcodeMultisig = require('@/contracts/SetcodeMultisigWallet.json');

export default {
  name: 'setWalletBySeed',
  errorCodes: {
    invalidSeed: 10,
  },
  handle: async function (task) {
    const {seed} = task.data;
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
    const address = await TonApi.predictAddress(server, keys.public, setcodeMultisig.abi, setcodeMultisig.imageBase64);

    await db.param.update('keys', {value: keys});
    await db.param.update('address', {value: address});
  }
}