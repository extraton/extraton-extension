import tonSdkLib from "@/api/tonSdk";
import database from '@/db';

export default {
  name: 'generateSeed',
  handle: async function () {
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;
    const seed = await tonSdkLib.generateSeed(server);

    return {seed};
  }
}
