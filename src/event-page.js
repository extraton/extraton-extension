import taskLib from '@/lib/task';
import {handleException} from "@/lib/task/exception/handleException";
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";

import {TonClient} from "@tonclient/core";
import {libWeb, libWebSetup} from "@tonclient/lib-web";

libWebSetup({
  binaryURL: "/tonclient_1.12.0.wasm",
});
TonClient.useBinaryLibrary(libWeb);

interactiveTaskRepository.makeProcessTasksUnknown();

const extensionId = chrome.runtime.id;
const handleMessage = async (request, sender) => {
  let result = {};
  try {
    if (extensionId !== sender.id) {
      throw 'extensionId <> senderId';
    }
    const isInternalRequest = sender.origin === `chrome-extension://${extensionId}`;
    let task;
    if (isInternalRequest) {
      task = taskLib.compileInternalTaskByRequest(request);
    } else {
      throw 'External tasks not implemented';
    }

    result.data = await taskLib.handleInternalTask(task);
    result.code = 0;
  } catch (e) {
    console.error(e);
    result.code = e instanceof handleException
      ? e.getCode()
      : 1;
    result.error = e.toString();
  }
  return result;
}
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (undefined === request.method) {
      return;
    }
    handleMessage(request, sender).then((result) => sendResponse(result));
    return true;
  }
);
