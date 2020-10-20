import StorageApi from "@/api/storage";
import {
  getNetworkTask,
  runGetTask,
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
} from "@/lib/task/items";
import taskNotExists from '@/lib/task/exception/taskNotExists';

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
  },
  external: {
    interactive: {},
    background: {getNetworkTask, runGetTask},
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
  handleBackgroundTask: async function (list, task) {
    return await _.getTaskHandler(list, task.method).handle(task.data);
  }
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
  addTaskToQueue: async function (task) {
    //@TODO locking??
    //@TODO check requestId duplicate?
    let tasks = await StorageApi.get('tasks');
    if (null === tasks) {
      tasks = {queue: [], handled: []};
    }
    tasks.queue.push(task);
    await StorageApi.set('tasks', tasks);
  },
  handleInternalTask: async function (task) {
    return _.handleBackgroundTask(taskList.internal, task);
  },
  handleExternalBackgroundTask: async function (task) {
    return _.handleBackgroundTask(taskList.external.background, task);
  }
};