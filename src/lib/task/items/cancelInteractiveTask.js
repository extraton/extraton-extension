import {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'cancelInteractiveTask',
  async handle({taskId}) {
    const task = await interactiveTaskRepository.getTask(taskId);
    if (task.statusId === interactiveTaskStatus.new) {
      let tasks = [];
      if (task.typeId === interactiveTaskType.deployWalletContract) {
        tasks = await interactiveTaskRepository.getActiveTasks();
      } else {
        tasks = [task];
      }
      for (let i in tasks) {
        tasks[i].statusId = interactiveTaskStatus.canceled;
      }
      await interactiveTaskRepository.updateTasks(tasks);
    }
    return await interactiveTaskRepository.getActiveTasks();
  }
}