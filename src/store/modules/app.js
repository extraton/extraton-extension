import store from '@/store'
import popupLib from '@/lib/popup';

export default {
  namespaced: true,
  state: {
    isInited: false,
  },
  mutations: {
    setInited: (state) => state.isInited = true,
  },
  actions: {
    init: async ({commit}) => {
      if (await popupLib.callPopup(false)) {
        window.close();
      } else {
        await store.dispatch('wallet/wakeup');
        await store.dispatch('action/startTaskUpdating');
        commit('setInited');
      }
    },
  },
}
