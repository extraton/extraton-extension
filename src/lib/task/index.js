import StorageApi from "@/api/storage";
import {
  getNetworkTask,
  requestTokensFromFaucetTask,
  getWakeUpDataTask,
  generateSeedTask,
  setWalletBySeedTask,
  changeNetworkTask,
  requestAddressDataTask,
  logoutTask,
  initUiTransferTask,
} from "@/lib/task/items";
import handleException from '@/lib/task/exception/handleException';

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
  },
  external: {
    interactive: {},
    background: {getNetworkTask,},
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
    return new Promise((resolve) => {
      _.getTaskHandler(list, task.method)
        .handle(task.data)
        .then((data) => resolve({code: 0, data}))
        .catch((error) => {
          console.error(error);
          const code = error instanceof handleException
            ? error.getCode()
            : 1;
          resolve({code, error})
        });
    });
  }
};

export default {
  compileExternalTaskByRequest: function (request) {
    const isInteractiveTask = _.isTaskInList(taskList.external.interactive, request.method);
    const isBackgroundTask = _.isTaskInList(taskList.external.background, request.method);
    if (!isInteractiveTask && !isBackgroundTask) {
      throw `Task method '${request.method}' not exists`;
    }
    return _.compileTaskByRequest(request, isInteractiveTask);
  },
  compileInternalTaskByRequest: function (request) {
    const isTaskExists = _.isTaskInList(taskList.internal, request.method);
    if (!isTaskExists) {
      throw `Task method '${request.method}' not exists`;
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