import {
  // interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'cancelInteractiveTask',
  async handle(i18n, task) {
    const {interactiveTaskId} = task.data;
    const interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);
    if ([interactiveTaskStatus.new, interactiveTaskStatus.prepared].includes(interactiveTask.statusId)) {
      let interactiveTasks = [];
      // if (interactiveTask.typeId === interactiveTaskType.deployWalletContract) {
      interactiveTasks = await interactiveTaskRepository.getActiveTasks();
      // } else {
      //   interactiveTasks = [interactiveTask];
      // }
      for (let i in interactiveTasks) {
        interactiveTasks[i].statusId = interactiveTaskStatus.canceled;
      }
      await interactiveTaskRepository.updateTasks(interactiveTasks);
    }
    return await interactiveTaskRepository.getAll();
  }
}
