import database from "@/db";
import TonApi from '@/api/ton';

export default {
  name: 'waitDeploy',
  handle: async function (task) {
    const {message, processingState} = task.data;
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;
    const result = await TonApi.waitForDeployTransaction(server, message, processingState);
    return result;
  }
}