import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'cnfrmTransaction',
  handle: async function (task) {
    const networkId = await paramRepository.get('network');

    if (networkId !== task.data.network.id) {
      throw new handleException(handleExceptionCodes.networkChanged.code);
    }
    // @TODO - getting information about transaction
    // await walletLib.getTransactionInfo(networkId, task.data.walletAddress, task.data.txid);

    return await interactiveTaskRepository.createTask(interactiveTaskType.cnfrmTransaction, networkId, task.requestId, task.data);
  }
}
