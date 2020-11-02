import database from "@/db";
import TonApi from '@/api/ton';

export default {
  name: 'runGet',
  handle: async function (task) {
    const {address, abi, method, params} = task.data;
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;
    // const q = await TonApi.runGet(server, address, method); @TODO empty output
    const result = await TonApi.run(server, address, method, abi, params);
    return result.output;
  }
}