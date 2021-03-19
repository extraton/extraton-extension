import {tokenRepository} from "@/db/repository/tokenRepository";
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";

export default {
  name: 'hideToken',
  handle: async function (task) {
    const {tokenId} = task.data;
    await tokenRepository.delete(tokenId);
    const tasks = await interactiveTaskRepository.getAll();
    const tokens = await tokenRepository.getAll();
    return {tasks, tokens};
  }
}
