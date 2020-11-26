import database from "@/db";
import TonApi from '@/api/ton';

export default {
  name: 'waitRun',
  handle: async function (task) {
    const {message, processingState} = task.data;
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;
    return await TonApi.waitForRunTransaction(server, message, processingState);
  }
}
