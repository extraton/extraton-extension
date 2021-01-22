import {
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'saveFormInteractiveTask',
  handle: async function (task) {
  const {interactiveTaskId, form} = task.data;
  let interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);
    interactiveTask.form = form;
    await interactiveTaskRepository.updateTasks([interactiveTask]);
  }
}
