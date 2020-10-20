import walletLib from '@/lib/wallet';
import {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'applyInteractiveTask',
  async handle({taskId, form}) {
    let task = await interactiveTaskRepository.getTask(taskId);
    if (task.statusId === interactiveTaskStatus.new) {

      task.statusId = interactiveTaskStatus.process;
      task.error = null;
      await interactiveTaskRepository.updateTasks([task]);

      try {
        //@TODO refactoring
        switch (task.typeId) {
          case interactiveTaskType.deployWalletContract: {
            await walletLib.deploy(task.networkId);
            break;
          }
          case interactiveTaskType.uiTransfer: {
            await walletLib.transfer(task.networkId, form.address, form.amount);
            break;
          }
          default: {
            throw 'Unknown interactive type.';
          }
        }
        task.statusId = interactiveTaskStatus.performed;
      } catch (e) {
        console.error(e);
        task.statusId = interactiveTaskStatus.new;
        task.error = 'Error';
        // throw e;
      }
      await interactiveTaskRepository.updateTasks([task]);
    }
    return await interactiveTaskRepository.getActiveTasks();
  }
}