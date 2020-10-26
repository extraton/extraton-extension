import BackgroundApi from "@/api/background";
import {setWalletBySeedTask} from "@/lib/task/items";
import store from "@/store";
import {handleExceptionCodes} from '@/lib/task/exception/handleException';

export default {
  namespaced: true,
  state: {
    isRestoring: false,
    error: null,
  },
  mutations: {
    setError: (state, error) => state.error = error,
    clearError: (state) => state.error = null,
    setRestoring: (state) => state.isRestoring = true,
    unsetRestoring: (state) => state.isRestoring = false,
    clear: (state) => {
      state.isRestoring = false;
      state.error = null;
    },
  },
  actions: {
    restore: async ({commit}, seed) => {
      commit('clearError');
      commit('setRestoring');
      BackgroundApi.request(setWalletBySeedTask, {seed})
        .then(async () => {
          await store.dispatch('wallet/wakeup');
        })
        .catch((err) => {
          commit('unsetRestoring');
          const message = err.code === handleExceptionCodes.invalidSeed.code
            ? 'Invalid seed phrase.'
            : 'Failure during wallet entering.';
          commit('setError', message);
        });
    },
  },
}
