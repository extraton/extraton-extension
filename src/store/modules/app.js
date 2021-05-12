import store from '@/store'

export default {
  namespaced: true,
  state: {
    isInited: false,
    i18n: null
  },
  mutations: {
    setInited: (state) => state.isInited = true,
    setI18n: (state, i18n) => state.i18n = i18n,
  },
  actions: {
    init: async ({commit}) => {
      await store.dispatch('wallet/wakeup');
      await store.dispatch('action/startTaskUpdating');
      commit('setInited');
    },
  },
}
