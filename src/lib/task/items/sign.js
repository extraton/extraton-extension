import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import database from "@/db";

export default {
  name: 'sign',
  handle: async function (task) {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    return await interactiveTaskRepository.createTask(interactiveTaskType.sign, networkId, task.requestId, task.data);
  }
}
