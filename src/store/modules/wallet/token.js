import BackgroundApi from '@/api/background';
import {router, routes} from "@/plugins/router";
import store from "@/store";
import {
  // requestCurrentWalletDataTask,
  initAddTokenTask,
  hideTokenTask,
  activateTokenTask,
  initUiTransferTokenTask,
} from "@/lib/task/items";

// const _ = {
//   updateBalancesEndless: async function (epoch, commit, state) {
//     if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
//       try {
//         const data = await BackgroundApi.request(requestCurrentWalletDataTask);
//         console.log(data);
        // if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
        //   commit('setNetworkAccountData', data);
        //   commit('setTokens', data.tokens);
        // }
      // } catch (err) {
      //   console.error(err);
      // } finally {
      //   if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
      //     setTimeout(async function () {
      //       await this.updateBalancesEndless(epoch, commit, state);
      //     }.bind(this), 4000);
      //   }
      // }
    // }
  // },
// };

export default {
  namespaced: true,
  state: {
    tokens: [],
    isAutoUpdatingOn: false,
    autoUpdateEpoch: 0,
    isTokenActivatingInit: false,
  },
  mutations: {
    setTokens: (state, tokens) => state.tokens = tokens,
    setTokenActivatingInit: (state, value) => state.isTokenActivatingInit = value,
    clear: (state) => {
      state.tokens = [];
      state.isAutoUpdatingOn = false;
    },
  },
  actions: {
    initAddToken: async () => {
      store.commit('globalError/clearText');
      const networkId = store.state.wallet.network;
      const walletId = store.state.wallet.walletId;
      return BackgroundApi.request(initAddTokenTask, {networkId, walletId})
        .then((tasks) => {
          store.commit('action/setTasks', tasks);
        })
        .catch(() => {
          store.commit('globalError/setText', 'Failure during add tokens initialization.');
        });
    },
    hideToken: async ({commit}, tokenId) => {
      store.commit('globalError/clearText');
      return BackgroundApi.request(hideTokenTask, {tokenId})
        .then(({tasks, tokens}) => {
          store.commit('action/setTasks', tasks);
          commit('setTokens', tokens);
          router.push({name: routes.wallet})
        })
        .catch(() => {
          store.commit('globalError/setText', 'Failure during hide token.');
        });
    },
    activateToken: async ({commit}, tokenId) => {
      store.commit('globalError/clearText');
      commit('setTokenActivatingInit', true);
      const networkId = store.state.wallet.network;
      return BackgroundApi.request(activateTokenTask, {networkId, tokenId})
        .then(({tasks}) => {
          store.commit('action/setTasks', tasks);
        })
        .catch(() => {
          store.commit('globalError/setText', 'Failure during activate token.');
        })
        .finally(() => commit('setTokenActivatingInit', false));
    },
    initTransfer: async (tools, {networkId, tokenId}) => {
      store.commit('globalError/clearText');
      return BackgroundApi.request(initUiTransferTokenTask, {networkId, tokenId})
        .then((tasks) => {
          store.commit('action/setTasks', tasks);
        })
        .catch(() => {
          store.commit('globalError/setText', 'Failure during transaction initialization.');
        });
    }
  },
  getters: {
    tokensByNetwork: (state) => state.tokens.filter((token) => token.networkId === store.state.wallet.network && token.walletId === store.state.wallet.walletId),
    token: (state) => (id) => state.tokens.find((token) => token.id === id),
    isTokenActive: (state) => (id) => state.tokens.find((token) => token.id === id).walletAddress !== null,
    isTokenDeploying: (state) => (id) => state.tokens.find((token) => token.id === id).isDeploying,
    isTransferAvailable: (state) => (id) => {
      const token = state.tokens.find((token) => token.id === id);
      if (null === token.walletAddress) {
        return false;
      }
      return null !== token.balance ? BigInt(token.balance) > BigInt(0) : false;
    }
  }
}
