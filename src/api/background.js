import store from "@/store";

export default {
  request: function (task, parameters = {}) {
    const data = {method: task.name, data: parameters};
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(data, (response) => {
        switch (response.code) {
          case 0:
            resolve(response.data);
            break;
          case 1201:
            store.commit('globalError/setText', 'Please, sync time on your device.');
            reject(response.error);
            break;
          default:
            console.error(response);
            reject(response.error);
        }
      });
    });
  },
}
