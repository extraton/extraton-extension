import database from "@/db";
import tonLib from "@/api/tonSdk";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'waitForTransaction',
  isLoginRequired: true,
  handle: async function (task) {
    const {message, shardBlockId, abi} = task.data;
    const db = await database.getClient();
    const networkId = await paramRepository.get('network');
    const server = (await db.network.get(networkId)).server;
    return await tonLib.waitForTransaction(server, message, abi, shardBlockId);
  }
}
