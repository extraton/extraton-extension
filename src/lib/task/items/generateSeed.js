import TonApi from '@/api/ton';
import database from '@/db';

export default {
  name: 'generateSeed',
  handle: async function () {
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;
    const seed = await TonApi.generateSeed(server);

    return {seed};
  }
}