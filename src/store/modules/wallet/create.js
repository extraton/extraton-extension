import BackgroundApi from "@/api/background";
import {generateSeedTask, setWalletBySeedTask} from "@/lib/task/items";
import store from "@/store";
import walletContractLib from '@/lib/walletContract';
import {routes} from "@/plugins/router";

export default {
  namespaced: true,
  state: {
    isGoingToWallet: false,
    seed: null,
  },
  mutations: {
    setSeed: (state, seed) => state.seed = seed,
    setIsGoingToWallet: (state) => state.isGoingToWallet = true,
    unsetIsGoingToWallet: (state) => state.isGoingToWallet = false,
    clear: (state) => {
      state.isGoingToWallet = false;
      state.seed = null;
    },
  },
  actions: {
    generateSeed: async ({commit}) => {
      BackgroundApi.request(generateSeedTask)
        .then(({seed}) => {
          commit('setSeed', seed);
        }).catch(() => store.commit('globalError/setText', 'Failure during seed generation.'));
    },
    goToWallet: async ({commit, state}, pass) => {
      commit('setIsGoingToWallet');
      store.commit('globalError/clearText');
      BackgroundApi.request(setWalletBySeedTask, {seed: state.seed, contractId: walletContractLib.ids.safeMultisig, isRestoring: false, pass})
        .then(async () => {
          await store.dispatch('wallet/wakeup', {name: routes.wallet, params: {}});
        })
        .catch((e) => {
          const error = (typeof e === 'string') ? e : 'Failure during wallet entering.';
          commit('unsetIsGoingToWallet');
          store.commit('globalError/setText', error);
        });
    },
  },
}
