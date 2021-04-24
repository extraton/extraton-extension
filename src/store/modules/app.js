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
    init: async ({commit}) => {
      await store.dispatch('wallet/wakeup');
      await store.dispatch('action/startTaskUpdating');
      commit('setInited');
    },
  },
}
