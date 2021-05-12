import store from "@/store";
import extensionizer from "extensionizer";

export default {
  request: function (task, parameters = {}) {
    const data = {method: task.name, data: parameters};
    return new Promise((resolve, reject) => {
      extensionizer.runtime.sendMessage(data).then((response) => {
        switch (response.code) {
          case 0:
            resolve(response.data);
            break;
          case 1201:
            store.commit('globalError/setText', store.state.app.i18n.t('globalError.syncTime'));
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
