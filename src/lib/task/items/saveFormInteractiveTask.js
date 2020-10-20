import {
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'saveFormInteractiveTask',
  handle: async function ({taskId, form}) {
    let task = await interactiveTaskRepository.getTask(taskId);
    task.form = form;
    await interactiveTaskRepository.updateTasks([task]);
  }
}