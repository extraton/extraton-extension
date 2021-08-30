import database from "@/db";
import TonApi from '@/api/ton';
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'runGet',
  isLoginRequired: true,
  handle: async function (task) {
    const {address, abi, method, params} = task.data;
    const db = await database.getClient();
    const networkId = await paramRepository.get('network');
    const server = (await db.network.get(networkId)).server;
    // const q = await TonApi.runGet(server, address, method); @TODO empty output
    const result = await TonApi.run(server, address, method, abi, params);
    return result.output;
  }
}
