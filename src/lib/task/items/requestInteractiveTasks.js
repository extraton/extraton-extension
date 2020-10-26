import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";

export default {
  name: 'requestInteractiveTasks',
  handle: async function () {
    return await interactiveTaskRepository.getAll();
  }
}