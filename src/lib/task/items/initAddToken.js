import {
  interactiveTaskType,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'initAddToken',
  handle: async function (task) {
    const {networkId, walletId} = task.data;
    await interactiveTaskRepository.createTask(
      interactiveTaskType.uiAddToken,
      networkId,
      null,
      {walletId}
    );
    return await interactiveTaskRepository.getAll();
  }
}
