import BackgroundApi from "@/api/background";
import {setWalletBySeedTask} from "@/lib/task/items";
import store from "@/store";
import {handleExceptionCodes} from '@/lib/task/exception/handleException';
import walletContractLib from '@/lib/walletContract';

export default {
  namespaced: true,
  state: {
    isRestoring: false,
    error: null,
    contracts: walletContractLib.compileSelectData(),
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
    restore: async ({commit}, {seed, contractId}) => {
      commit('clearError');
      commit('setRestoring');
      BackgroundApi.request(setWalletBySeedTask, {seed, contractId})
        .then(async () => {
          await store.dispatch('wallet/wakeup');
          commit('unsetRestoring');
        })
        .catch((err) => {
          const message = err.code === handleExceptionCodes.invalidSeed.code
            ? 'Invalid seed phrase.'
            : 'Failure during wallet entering.';
          commit('setError', message);
          commit('unsetRestoring');
        });
    },
  },
}
