import taskLib from '@/lib/task';
import {handleException} from "@/lib/task/exception/handleException";
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";
import {TonClient} from "@tonclient/core";
import {libWeb, libWebSetup} from "@tonclient/lib-web";
import i18n from "i18n-js";
import loadLocaleMessages from "@/locales/loadLocaleMessages";
import {paramRepository} from "@/db/repository/paramRepository";
import extensionizer from "extensionizer";
import database from "@/db";

libWebSetup({
  binaryURL: "/tonclient_1.12.0.wasm",
});
TonClient.useBinaryLibrary(libWeb);

i18n.defaultLocale = 'en';
i18n.translations = loadLocaleMessages();
i18n.fallbacks = true;
taskLib.setI18n(i18n);

interactiveTaskRepository.makeProcessTasksUnknown();

function getExtensionOrigin(senderType) {
  let id;
  switch (senderType) {
    case 'chrome': {
      id = extensionizer.runtime.id;
      break;
    }
    case 'moz': {
      const defaultPopup = extensionizer.runtime.getManifest().browser_action.default_popup;
      const match = /^moz-extension:\/\/([a-z0-9-]+)\//g.exec(defaultPopup);
      id = match[1];
      break;
    }
    default: {
      throw `Unknown browser: '${browser}'`;
    }
  }
  return `${senderType}-extension://${id}`;
}

function isInternalRequest(senderUrl) {
  const isSenderExtension = null !== senderUrl.match(/^([a-z]+)-extension:\/\//g);
  if (!isSenderExtension) {
    return false;
  }
  const senderType = /^([a-z]+)-extension:\/\//g.exec(senderUrl)[1];
  const extensionOrigin = getExtensionOrigin(senderType);
  return senderUrl.indexOf(extensionOrigin) === 0;
}

async function init() {
  const extensionId = extensionizer.runtime.id;
  const handleMessage = async (request, sender) => {
    const locale = await paramRepository.getParam('language');
    i18n.locale = locale;
    let result = {};
    try {
      if (extensionId !== sender.id) {
        throw 'extensionId <> senderId';
      }
      let task;
      if (isInternalRequest(sender.url)) {
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
  extensionizer.runtime.onInstalled.addListener(async function () {
    await database.init();
  });
  extensionizer.runtime.onMessage.addListener(
    (request, sender) => {
      if (undefined !== request.method) {
        return handleMessage(request, sender);
      }
    }
  )
}

init();
