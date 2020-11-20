import database from "@/db";
import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
// import TonApi from '@/api/ton';

export default {
  name: 'transfer',
  handle: async function (task) {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;

    if (networkId !== task.data.network.id) {
      throw new handleException(handleExceptionCodes.networkChanged.code);
    }

    if (!await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    }

    return await interactiveTaskRepository.createTask(interactiveTaskType.transfer, networkId, task.requestId, task.data);
  }
}
