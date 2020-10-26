import {
  getNetworkTask,
  runGetTask,
  waitDeployTask,
  deployTask,
  requestTokensFromFaucetTask,
  getWakeUpDataTask,
  generateSeedTask,
  setWalletBySeedTask,
  changeNetworkTask,
  requestAddressDataTask,
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

const taskList = {
  internal: {
    getWakeUpDataTask,
    requestTokensFromFaucetTask,
    generateSeedTask,
    setWalletBySeedTask,
    changeNetworkTask,
    requestAddressDataTask,
    logoutTask,
    initUiTransferTask,
    cancelInteractiveTaskTask,
    applyInteractiveTaskTask,
    saveFormInteractiveTaskTask,
    requestInteractiveTasksTask,
  },
  external: {
    interactive: {deployTask},
    background: {getNetworkTask, runGetTask, waitDeployTask},
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
  compileTaskByRequest: function (request, isInteractive = false) {
    return {
      requestId: request.requestId,
      method: request.method,
      data: request.data,
      isInteractive,
    };
  },
  handleTask: async function (list, task) {
    return await _.getTaskHandler(list, task.method).handle(task);
  },
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

export default {
  compileExternalTaskByRequest: function (request) {
    const isInteractiveTask = _.isTaskInList(taskList.external.interactive, request.method);
    const isBackgroundTask = _.isTaskInList(taskList.external.background, request.method);
    if (!isInteractiveTask && !isBackgroundTask) {
      throw new taskNotExists(request.method);
    }
    return _.compileTaskByRequest(request, isInteractiveTask);
  },
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
  handleExternalBackgroundTask: async function (task) {
    return _.handleTask(taskList.external.background, task);
  },
  handleExternalInteractiveTask: async function (task) {
    return _.handleTask(taskList.external.interactive, task);
  }
};