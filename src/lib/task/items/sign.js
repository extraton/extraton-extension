import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'sign',
  handle: async function (task) {
    const networkId = await paramRepository.get('network');
    return await interactiveTaskRepository.createTask(interactiveTaskType.sign, networkId, task.requestId, task.data);
  }
}
