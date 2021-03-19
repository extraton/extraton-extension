import BackgroundApi from "@/api/background";
import {setSettingTask} from "@/lib/task/items";
import store from "@/store";

export default {
  namespaced: true,
  state: {
    tip3: false,
  },
  mutations: {
    setSettings: (state, settings) => {
      state.tip3 = settings.tip3;
    },
    setTip3: (state, value) => state.tip3 = value,
  },
  actions: {
    changeTip3: async ({commit}, value) => {
      store.commit('globalError/clearText');
      BackgroundApi.request(setSettingTask, {name: 'tip3', value})
        .then(() => {
          commit('setTip3', value);
        })
        .catch((err) => {
          console.error(err);
          store.commit('globalError/setText', 'Failure during wallet changing.');
        });
    },
  },
}
