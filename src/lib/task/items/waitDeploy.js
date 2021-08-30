import database from "@/db";
import TonApi from '@/api/ton';
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'waitDeploy',
  isLoginRequired: true,
  handle: async function (task) {
    const {message, processingState} = task.data;
    const db = await database.getClient();
    const networkId = await paramRepository.get('network');
    const server = (await db.network.get(networkId)).server;
    const result = await TonApi.waitForDeployTransaction(server, message, processingState);
    return result;
  }
}
