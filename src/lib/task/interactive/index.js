import addTokenInteractiveTask from "@/lib/task/interactive/addToken";
import confirmTransactionInteractiveTask from "@/lib/task/interactive/confirmTransaction";
import deployContractInteractiveTask from "@/lib/task/interactive/deployContract";
import deployWalletContractInteractiveTask from "@/lib/task/interactive/deployWalletContract";
import preDeployTransferInteractiveTask from "@/lib/task/interactive/preDeployTransfer";
import runTransactionInteractiveTask from "@/lib/task/interactive/runTransaction";
import transferInteractiveTask from "@/lib/task/interactive/transfer";
import uiTransferInteractiveTask from "@/lib/task/interactive/uiTransfer";

const tasks = [
  addTokenInteractiveTask,
  confirmTransactionInteractiveTask,
  deployContractInteractiveTask,
  deployWalletContractInteractiveTask,
  preDeployTransferInteractiveTask,
  runTransactionInteractiveTask,
  transferInteractiveTask,
  uiTransferInteractiveTask,
];

export default {
  getHandlerByTypeId: (typeId) => {
    for (const task of tasks) {
      if (typeId === task.typeId) {
        return task;
      }
    }
    throw `Task with typeId ${typeId} not found.`;
  },

}
