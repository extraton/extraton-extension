import BackgroundApi from '@/api/background';
import {router, routes} from "@/plugins/router";
import store from "@/store";
import {
  initAddTokenTask,
  hideTokenTask,
  activateTokenTask,
  initUiTransferTokenTask,
} from "@/lib/task/items";
import walletLib from '@/lib/wallet';

const _ = {
  ft(tokens, id) {
    return tokens.find((token) => token.id === id);
  },
};

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
    token: ({tokens}) => (id) => _.ft(tokens, id),
    isTokenActive: ({tokens}) => (id) => _.ft(tokens, id).walletAddress !== null,
    isTokenDeploying: ({tokens}) => (id) => _.ft(tokens, id).isDeploying,
    isTransferAvailable: ({tokens}) => (id) => {
      const token = _.ft(tokens, id);
      if (null === token.walletAddress) {
        return false;
      }
      return null !== token.balance ? BigInt(token.balance) > BigInt(0) : false;
    },
    balanceView: ({tokens}) => (id) => {
      const token = _.ft(tokens, id);
      return walletLib.convertToView(token.balance, token.decimals);
    },
  }
}
