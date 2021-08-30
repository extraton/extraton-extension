import popupLib from '@/lib/popup';
import taskLib from '@/lib/task';
import walletLib from '@/lib/wallet';
import {handleException} from "@/lib/task/exception/handleException";
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";
import extensionizer from "extensionizer";
import database from "@/db";
import {TonClient} from "@tonclient/core";
import {libWeb, libWebSetup} from "@tonclient/lib-web";
libWebSetup({
  binaryURL: "/tonclient_1.5.3.wasm",
});
TonClient.useBinaryLibrary(libWeb);

interactiveTaskRepository.makeProcessTasksUnknown();

const extensionId = chrome.runtime.id;
const handleMessage = async (request, sender) => {
  let result = {};
  try {
    //@TODO make sure this check required
    if (extensionId !== sender.id) {
      throw 'extensionId <> senderId';
    }
    //@TODO make sure can check it like this
    const isInternalRequest = sender.origin === `chrome-extension://${extensionId}`;
    let task;
    console.log(`Call method: ${request.method}`);
    if (isInternalRequest) {
      task = taskLib.compileInternalTaskByRequest(request);
    } else {
      //@TODO site connection:  console.log({eventPageSender: sender});
      result.requestId = request.requestId;
      task = taskLib.compileExternalTaskByRequest(request, sender.tab.id);
    }

    if (task.isInteractive) {
      const interactiveTask = await taskLib.handleExternalInteractiveTask(task);
      await popupLib.callPopup();
      result.data = await taskLib.waitInteractiveTaskResolving(task, interactiveTask.id);
      result.code = 0;
    } else {
      if (!isInternalRequest && !await walletLib.isLoggedIn() && task.isLoginRequired) {
        await popupLib.callPopup();
        await walletLib.waitLoggedIn();
      }
      result.data = isInternalRequest
        ? await taskLib.handleInternalTask(task)
        : await taskLib.handleExternalBackgroundTask(task);
      result.code = 0;
    }
  } catch (e) {
    console.error(e);
    result.code = e instanceof handleException
      ? e.getCode()
      : 1;
    result.error = e.toString();
  }
  // console.log({result});
  return result;
}
extensionizer.runtime.onInstalled.addListener(async function () {
  await database.init();
});
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
