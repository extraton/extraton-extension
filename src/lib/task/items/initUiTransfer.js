import walletLib from '@/lib/wallet';
import {
  interactiveTaskType,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'initUiTransfer',
  handle: async function ({networkId}) {
    if (!await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId);
    }
    await interactiveTaskRepository.createTask(interactiveTaskType.uiTransfer, networkId);
    return await interactiveTaskRepository.getActiveTasks();
  }
}