import browserLib from '@/lib/browser';
import StorageApi from "@/api/storage";

const _ = {
  createPopup: async function (position) {
    return new Promise((resolve) => {
      chrome.windows.create({
        url: 'index.html',
        type: 'popup',
        width: 310,
        height: 536,
        left: position.x,
        top: position.y,
      }, (popup) => {
        resolve(popup);
      });
    })
  },
  getLastFocusedWindow: function () {
    return new Promise((resolve) => {
      chrome.windows.getLastFocused((windowObject) => {
        browserLib.throwErrorIfOccurred();
        return resolve(windowObject);
      });
    });
  },
  getAllWindows: function () {
    return new Promise((resolve) => {
      chrome.windows.getAll((windows) => {
        browserLib.throwErrorIfOccurred();
        return resolve(windows)
      });
    });
  },
  getCurrentWindow: function () {
    return new Promise((resolve) => {
      chrome.windows.getCurrent((windows) => {
        browserLib.throwErrorIfOccurred();
        return resolve(windows)
      });
    });
  },
  findPopup: async function () {
    const popup = await StorageApi.get('popup');
    if (null === popup) {
      return null;
    }
    const windows = await this.getAllWindows();
    for (let i in windows) {
      if (windows[i].id === popup.id) {
        return windows[i];
      }
    }
    return null;
  },
  focusWindow: async function (id) {
    return new Promise((resolve) => {
      chrome.windows.update(id, {focused: true}, () => {
        browserLib.throwErrorIfOccurred();
        return resolve()
      });
    });
  },
}

export default {
  callPopup: async function (doCreateIfNotExists = true) {
    let popup = await _.findPopup();
    if (null !== popup) {
      const currentWindow = await _.getCurrentWindow();
      if (currentWindow.id === popup.id) {
        return false;
      }
      await _.focusWindow(popup.id);
      return true;
    } else if (doCreateIfNotExists) {
      let position = {x: 0, y: 0};
      try {
        const lastFocused = await _.getLastFocusedWindow();
        position.x = lastFocused.left + (lastFocused.width - 300 - 20);
        position.y = lastFocused.top + 20;
      } catch (err) {
        position.x = Math.max(window.screenX + (window.outerWidth - 300), 0);
        position.y = Math.max(window.screenY, 0);
      }
      popup = await _.createPopup(position);
      await StorageApi.set('popup', {id: popup.id});
      return true;
    }
    return false;
  },
  getCurrentWindow: async function () {
    return await _.getCurrentWindow();
  }
};