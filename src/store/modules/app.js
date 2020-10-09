import StorageApi from '@/api/storage';
import store from '@/store'

export default {
  namespaced: true,
  state: {
    isInited: false,
  },
  mutations: {
    setInited: (state) => state.isInited = true,
  },
  actions: {
    init: ({commit}) => {
      StorageApi.get('wallet').then(async (sleepState) => {
        console.log(sleepState);
        if (null !== sleepState) {
          await store.dispatch('wallet/wakeup', sleepState);
          await store.dispatch('wallet/enterWallet');
        }
        commit('setInited');
      });
    },
  },
}
