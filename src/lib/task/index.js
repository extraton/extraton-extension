import {
  getWakeUpDataTask,
  generateSeedTask,
  setWalletBySeedTask,
  removeWalletTask,
  changeWalletTask,
  editWalletTask,
  changeNetworkTask,
  setPageTask,
  setSettingTask,
  requestCurrentWalletDataTask,
  thatsMyAddressTask,
  logoutTask,
  initUiTransferTask,
  cancelInteractiveTaskTask,
  applyInteractiveTaskTask,
  saveFormInteractiveTaskTask,
  requestInteractiveTasksTask,
} from "@/lib/task/items";
import taskNotExists from '@/lib/task/exception/taskNotExists';
import {interactiveTaskRepository, interactiveTaskStatus} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from '@/lib/task/exception/handleException';
import {tonException, tonExceptionCodes} from '@/api/exception/tonException';

const taskList = {
  internal: {
    getWakeUpDataTask,
    generateSeedTask,
    setWalletBySeedTask,
    removeWalletTask,
    changeWalletTask,
    editWalletTask,
    changeNetworkTask,
    setPageTask,
    setSettingTask,
    requestCurrentWalletDataTask,
    thatsMyAddressTask,
    logoutTask,
    initUiTransferTask,
    cancelInteractiveTaskTask,
    applyInteractiveTaskTask,
    saveFormInteractiveTaskTask,
    requestInteractiveTasksTask,
  },
};
const _ = {
  getTaskHandler: function (list, name) {
    for (let i in list) {
      if (list[i].name === name) {
        return list[i];
      }
    }
    return null;
  },
  isTaskInList: function (list, name) {
    return this.getTaskHandler(list, name) !== null;
  },
  compileTaskByRequest: function (request) {
    return {
      requestId: request.requestId,
      method: request.method,
      data: request.data,
    };
  },
  handleTask: async function (list, task) {
    try {
      return await _.getTaskHandler(list, task.method).handle(task);
    } catch (e) {
      if (e instanceof tonException) {
        switch (e.code) {
          case tonExceptionCodes.syncTime:
            throw new handleException(handleExceptionCodes.syncTime.code);
          default:
            throw new handleException(handleExceptionCodes.tonClientError.code, e.message);
        }
      }
      throw e;
    }
  },
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

export default {
  compileInternalTaskByRequest: function (request) {
    const isTaskExists = _.isTaskInList(taskList.internal, request.method);
    if (!isTaskExists) {
      throw new taskNotExists(request.method);
    }
    return _.compileTaskByRequest(request);
  },
  waitInteractiveTaskResolving: async function (task, interactiveTaskId) {
    if (await interactiveTaskRepository.isOneOfTaskByRequestIdCanceled(task.requestId)) {
      throw new handleException(handleExceptionCodes.canceledByUser.code)
    }
    const interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.performed) {
      return interactiveTask.result;
    }
    await _.timeout(500);
    return await this.waitInteractiveTaskResolving(task, interactiveTaskId);
  },
  handleInternalTask: async function (task) {
    return _.handleTask(taskList.internal, task);
  },
};
