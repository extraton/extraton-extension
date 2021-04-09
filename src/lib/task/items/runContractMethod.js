import database from "@/db";
import tonLib from "@/api/tonSdk";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";

export default {
  name: 'runContractMethod',
  handle: async function (task) {
    const {address, abi, method, input} = task.data;
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;
    const account = await tonLib.requestAccountData(server, address);
    if (null === account) {
      throw new handleException(handleExceptionCodes.accountNotExists.code);
    }
    const contractAbi = tonLib.compileContractAbi(abi);
    const message = await tonLib.encodeMessage(server, address, contractAbi, method, input);
    return await tonLib.runTvm(server, contractAbi, account.boc, message.message);
  }
}
