import TonApi from '@/api/ton';
import database from '@/db';
import handleException from '@/lib/task/exception/handleException';

export default {
  name: 'setWalletBySeed',
  errorCodes: {
    invalidSeed: 10,
  },
  handle: async function ({seed}) {
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;
    let keys = null;
    try {
      keys = await TonApi.convertSeedToKeys(server, seed);
    } catch (err) {
      if (err.code === 2017) {
        throw new handleException(this.errorCodes.invalidSeed);
      } else {
        throw err;
      }
    }
    const address = await TonApi.predictAddress(server, keys.public);

    await db.param.update('keys', {value: keys});
    await db.param.update('address', {value: address});
  }
}