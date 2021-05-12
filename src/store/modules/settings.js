import BackgroundApi from "@/api/background";
import {setSettingTask} from "@/lib/task/items";
import store from "@/store";

export default {
  namespaced: true,
  state: {
    language: null,
  },
  mutations: {
    setSettings: (state, settings) => {
      state.language = settings.language;
    },
  },
  actions: {
    changeLanguage: async (tools, value) => {
      store.commit('globalError/clearText');
      BackgroundApi.request(setSettingTask, {name: 'language', value})
        .then(() => {
          location.reload();
        })
        .catch((err) => {
          console.error(err);
          store.commit('globalError/setText', store.state.app.i18n.t('globalError.changeLanguage'));
        });
    },
  },
}
