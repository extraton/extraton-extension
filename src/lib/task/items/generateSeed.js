import database from '@/db';
import tonLib from "@/api/tonSdk";

export default {
  name: 'generateSeed',
  handle: async function () {
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;
    const seed = await tonLib.generateSeed(server);

    return {seed};
  }
}
