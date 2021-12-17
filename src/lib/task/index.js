import {
  getNetworkTask,
  getPublicKeyTask,
  getVersionTask,
  hasSignerTask,
  subscribeToEventsTask,
  runContractMethodTask,
  waitRunTask,
  waitForTransactionTask,
  getAddressTask,
  deployTask,
  callContractMethodTask,
  signTask,
  transferTask,
  trnsfrTask,
  confirmTransactionTask,
  cnfrmTransactionTask,
  getWakeUpDataTask,
  generateSeedTask,
  setWalletBySeedTask,
  removeSiteTask,
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
  encryptKeysTask,
  setWalletByKeystoreTask,
} from "../task/items";
import taskNotExists from '@/lib/task/exception/taskNotExists';
import {interactiveTaskRepository, interactiveTaskStatus} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from '@/lib/task/exception/handleException';
import {tonException, tonExceptionCodes} from '@/api/exception/tonException';
import keystoreException from "@/lib/keystore/keystoreException";

const taskList = {
  internal: {
    getWakeUpDataTask,
    generateSeedTask,
    setWalletBySeedTask,
    removeSiteTask,
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
    encryptKeysTask,
    setWalletByKeystoreTask,
  },
  external: {
    interactive: {
      deployTask,
      callContractMethodTask,
      signTask,
      transferTask,
      trnsfrTask,
      confirmTransactionTask,
      cnfrmTransactionTask,
    },
    background: {
      getNetworkTask,
      getPublicKeyTask,
      getVersionTask,
      hasSignerTask,
      subscribeToEventsTask,
      runContractMethodTask,
      waitRunTask,
      waitForTransactionTask,
      getAddressTask,
    },
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
  compileTaskByRequest: function (request, isInteractive = false, tabId = null, isLoginRequired = true, isAutoConfirm = false) {
    return {
      requestId: request.requestId,
      method: request.method,
      data: request.data,
      isInteractive,
      tabId,
      isLoginRequired,
      isAutoConfirm,
    };
  },
  handleTask: async function (list, task) {
    try {
      return await _.getTaskHandler(list, task.method).handle(task);
    } catch (e) { //@TODO move it out here
      if (e instanceof tonException) {
        switch (e.code) {
          case tonExceptionCodes.syncTime:
            throw new handleException(handleExceptionCodes.syncTime.code);
          default:
            throw new handleException(handleExceptionCodes.tonClientError.code, e.message);
        }
      } else if (e instanceof keystoreException) {
        throw new handleException(handleExceptionCodes.keystore.code, e.message);
      }
      throw e;
    }
  },
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

export default {
  compileExternalTaskByRequest: function (request, tabId, isAutoConfirm) {
    const isInteractiveTask = _.isTaskInList(taskList.external.interactive, request.method);
    const isBackgroundTask = _.isTaskInList(taskList.external.background, request.method);
    if (!isInteractiveTask && !isBackgroundTask) {
      throw new taskNotExists(request.method);
    }
    let isLoginRequired = true;
    if (isBackgroundTask) {
      isLoginRequired = _.getTaskHandler(taskList.external.background, request.method).isLoginRequired;
    }
    return _.compileTaskByRequest(request, isInteractiveTask, tabId, isLoginRequired, isAutoConfirm);
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
    // check is it autoConfirm and on the his queue, try to perform.
    if (interactiveTask.statusId === interactiveTaskStatus.new && true === interactiveTask.isAutoConfirm) {
      const activeTask = await interactiveTaskRepository.findCurrentTask();
      if (activeTask.requestId === interactiveTask.requestId && activeTask.statusId === interactiveTaskStatus.new && true === activeTask.isAutoConfirm) {
        const autoApplyTask = this.compileInternalTaskByRequest({//@TODO refactoring
          requestId: task.requestId,
          method: applyInteractiveTaskTask.name,
          data: {interactiveTaskId: activeTask.id, password: '', form: {}}
        });
        await this.handleInternalTask(autoApplyTask);
      }
    }
    if (interactiveTask.statusId === interactiveTaskStatus.performed) {
      return interactiveTask.result;
    }
    await _.timeout(500);
    return await this.waitInteractiveTaskResolving(task, interactiveTaskId);//@TODO recursive -> while
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
