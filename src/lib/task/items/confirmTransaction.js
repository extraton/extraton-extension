import database from "@/db";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";

export default {
  name: 'confirmTransaction',
  handle: async function (task) {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;

    if (networkId !== task.data.network.id) {
      throw new handleException(handleExceptionCodes.networkChanged.code);
    }
    // @TODO - getting information about transaction
    // await walletLib.getTransactionInfo(networkId, task.data.walletAddress, task.data.txid);

    return await interactiveTaskRepository.createTask(interactiveTaskType.confirmTransaction, networkId, task.requestId, task.data);
  }
}
