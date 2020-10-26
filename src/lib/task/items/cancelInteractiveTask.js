import {
  // interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'cancelInteractiveTask',
  async handle(task) {
    const {interactiveTaskId} = task.data;
    const interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.new) {
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