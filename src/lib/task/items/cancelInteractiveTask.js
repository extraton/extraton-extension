import {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';
import {siteRepository} from "../../../db/repository/siteRepository";
import interactiveTaskCallback from "@/lib/task/interactive/callback";

export default {
  name: 'cancelInteractiveTask',
  async handle(task) {
    const {interactiveTaskId} = task.data;
    const interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);

    switch (interactiveTask.typeId) {
      case interactiveTaskType.permitSite: {
        await siteRepository.setPermissions(interactiveTask.data.siteId, false, false);
        interactiveTask.data.frontPostApply = await interactiveTaskCallback.call(interactiveTask.data.callback);//@TODO common
        break;
      }
    }


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
    const interactiveTasks = await interactiveTaskRepository.getAll();
    return {interactiveTasks, interactiveTask};
  }
}
