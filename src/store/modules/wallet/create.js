import BackgroundApi from "@/api/background";
import {generateSeedTask, setWalletBySeedTask} from "@/lib/task/items";
import store from "@/store";
import {routes} from "@/plugins/router";

export default {
  namespaced: true,
  state: {
    isGoingToWallet: false,
    contractId: null,
    seed: null,
    saved: false,
  },
  mutations: {
    setSeed: (state, seed) => state.seed = seed,
    setIsGoingToWallet: (state) => state.isGoingToWallet = true,
    unsetIsGoingToWallet: (state) => state.isGoingToWallet = false,
    toCheck: (state) => state.saved = true,
    setContractId: (state, value) => state.contractId = value,
    clear: (state) => {
      state.isGoingToWallet = false;
      state.contractId = null;
      state.seed = null;
      state.saved = false;
    },
  },
  actions: {
    generateSeed: async ({commit}) => {
      BackgroundApi.request(generateSeedTask)
        .then(({seed}) => {
          commit('setSeed', seed);
        }).catch(() => store.commit('globalError/setText', store.state.app.i18n.t('globalError.seedGeneration')));
    },
    goToWallet: async ({commit, state}, pass) => {
      commit('setIsGoingToWallet');
      store.commit('globalError/clearText');
      BackgroundApi.request(setWalletBySeedTask, {seed: state.seed, contractId: state.contractId, isRestoring: false, pass})
        .then(async () => {
          await store.dispatch('wallet/wakeup', {name: routes.wallet, params: {}});
        })
        .catch((e) => {
          const error = (typeof e === 'string') ? e : store.state.app.i18n.t('globalError.walletEntering');
          commit('unsetIsGoingToWallet');
          store.commit('globalError/setText', error);
        });
    },
  },
}
