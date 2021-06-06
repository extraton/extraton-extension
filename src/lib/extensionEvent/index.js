import extensionizer from 'extensionizer'
import {subscriberRepository} from "@/db/repository/subscriberRepository";
import browserLib from "@/lib/browser";

const extensionEventType = {
  changeNetwork: 1,
  changeWallet: 2,
  logout: 3,
};

const _ = {
  getEventNameById(id) {
    for (const eventName of Object.keys(extensionEventType)) {
      if (id === extensionEventType[eventName]) {
        return eventName;
      }
    }
    throw `Unknown event '${id}'`;
  },
  async unsubscribe(tabId) {
    await subscriberRepository.remove(tabId);
  },
}

const extensionEvent = {
  async subscribe(tabId) {
    if (null === await subscriberRepository.findByTabId(tabId)) {
      await subscriberRepository.create(tabId);
    }
  },
  async emit(typeId) {
    const subscribers = await subscriberRepository.getAll();
    for (const subscriber of subscribers) {
      chrome.tabs.get(subscriber.tabId, async function (tab) {
        const error = browserLib.findError()
        if (null !== error) {
          console.warn(error);
        }
        if (typeof tab === 'undefined') {
          await _.unsubscribe(subscriber.tabId);
        } else {
          const eventName = _.getEventNameById(typeId);
          extensionizer.tabs.sendMessage(subscriber.tabId, {name: eventName});
        }
      });
    }
  }
};

export {
  extensionEventType,
  extensionEvent,
}
