import TonApi from '@/api/ton';
import database from '@/db';
import {handleException, handleExceptionCodes} from '@/lib/task/exception/handleException';
import contractLib from '@/lib/contract';

export default {
  name: 'setWalletBySeed',
  errorCodes: {
    invalidSeed: 10,
  },
  handle: async function (task) {
    const {seed, contractId} = task.data;
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
    const contract = contractLib.getContractById(contractId);
    const address = await TonApi.predictAddress(server, keys.public, contract.abi, contract.imageBase64);

    await db.param.update('keys', {value: keys});
    await db.param.update('address', {value: address});
    await db.param.update('contractId', {value: contractId});
  }
}