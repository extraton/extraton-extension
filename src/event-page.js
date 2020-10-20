import StorageApi from '@/api/storage';
import popupLib from '@/lib/popup';
import taskLib from '@/lib/task';
import walletLib from '@/lib/wallet';
import handleException from "@/lib/task/exception/handleException";

const extensionId = chrome.runtime.id;
const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
//@TODO infinity
const waitTaskResolving = async (task) => {
  //@TODO locking??
  let tasks = await StorageApi.get('tasks');
  for (let i = tasks.handled.length - 1; i >= 0; i--) {
    if (tasks.handled[i].requestId === task.requestId) {
      const result = tasks.handled[i].result;
      tasks.handled.splice(i, 1);
      return result;
    }
  }
  await timeout(500);
  return await waitTaskResolving(task);
};
const handleMessage = async (request, sender) => {
  let result = {};
  try {
    if (extensionId !== sender.id) {
      throw 'extensionId <> senderId';
    }
    //@TODO make sure can check it like this
    const isInternalRequest = sender.origin === `chrome-extension://${extensionId}`;
    let task;
    if (isInternalRequest) {
      task = taskLib.compileInternalTaskByRequest(request);
    } else {
      //@TODO site connection:  console.log({eventPageSender: sender});
      result.requestId = request.requestId;
      task = taskLib.compileExternalTaskByRequest(request);
    }

    if (task.isInteractive) {
      await taskLib.addTaskToQueue(task);
      await popupLib.callPopup();
      result = await waitTaskResolving(task);
    } else {
      if (!isInternalRequest && !await walletLib.isLoggedIn()) {
        await popupLib.callPopup();
        await walletLib.waitLoggedIn();
      }
      result.code = 0;
      result.data = isInternalRequest
        ? await taskLib.handleInternalTask(task)
        : await taskLib.handleExternalBackgroundTask(task);
    }
  } catch (e) {
    result.code = e instanceof handleException
      ? e.getCode()
      : 1;
    result.error = e.toString();
  }
  return result;
}
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    //@TODO
    if (undefined === request.method) {
      return;
    }
    handleMessage(request, sender).then((result) => sendResponse(result));
    return true;
  }
);