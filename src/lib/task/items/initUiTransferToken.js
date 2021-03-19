import {
  interactiveTaskType,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';

export default {
  name: 'initUiTransferToken',
  handle: async function (task) {
    const {networkId, tokenId,} = task.data;
    //@TODO FEES
    const fees = '0.011'
    const data = {fees};
    task.data.tokenId = tokenId;
    await interactiveTaskRepository.createTask(interactiveTaskType.uiTransferToken, networkId, task.requestId, task.data, data);
    return await interactiveTaskRepository.getAll();
  }
}
