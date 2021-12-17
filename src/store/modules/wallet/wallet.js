import BackgroundApi from '@/api/background';
import {router, routes} from "@/plugins/router";
import store from "@/store";
import walletLib from "@/lib/wallet";
import {
  getWakeUpDataTask,
  changeNetworkTask,
  changeWalletTask,
  requestCurrentWalletDataTask,
  logoutTask,
  initUiTransferTask,
  thatsMyAddressTask,
} from "@/lib/task/items";

const _ = {
  updateBalanceEndless: async function (epoch, commit, state) {
    if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
      try {
        const {walletId, networkId, data} = await BackgroundApi.request(requestCurrentWalletDataTask);
        if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
          commit('setNetworkAccountData', {walletId, networkId, data});
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
          setTimeout(async function () {
            await this.updateBalanceEndless(epoch, commit, state);
          }.bind(this), 4000);
        }
      }
    }
  },
  isBalancePositive(state) {
    const balance = state.wallets[state.walletId].networks[state.network].balance;
    return null !== balance ? BigInt(balance) > BigInt(0) : false;
  },
  hasContract: (state) => state.wallets[state.walletId].networks[state.network].codeHash !== null,
};

export default {
  namespaced: true,
  state: {
    wallets: null,
    walletId: null,
    network: null,
    networks: null,
    isAutoUpdatingOn: false,
    autoUpdateEpoch: 0,
    isAddressDataGotOnce: false
  },
  mutations: {
    setNetwork: (state, network) => state.network = network,
    setAutoUpdateOn: (state) => state.isAutoUpdatingOn = true,
    nextAutoUpdateEpoch: (state) => state.autoUpdateEpoch += 1,
    setWallet: (state, walletId) => state.walletId = walletId,
    thatsMyAddress: (state) => state.wallets[state.walletId].isWalletMine = true,
    clear: (state) => {
      state.wallets = null;
      state.walletId = null;
      state.network = null;
      state.networks = null;
      state.isAutoUpdatingOn = false;
      state.isAddressDataGotOnce = false;
    },
    applySleepState: (state, sleepState) => {
      state.wallets = sleepState.wallets;
      state.walletId = sleepState.walletId;
      state.network = sleepState.network;
      state.networks = sleepState.networks;
    },
    setWalletsAfterRemoving: (state, {wallets, walletId}) => {
      state.walletId = walletId;
      state.wallets = wallets;
    },
    setNetworkAccountData: (state, {walletId, networkId, data}) => {
      state.wallets[walletId].networks[networkId] = data;
      state.isAddressDataGotOnce = true;
    },
  },
  actions: {
    enterWallet: async (tools, page) => {
      const to = page !== null ? page : {name: routes.wallet};
      return router.push(to);
    },
    goToStart: () => router.push({name: routes.start}),
    logout: async ({commit}) => {
      await BackgroundApi.request(logoutTask);
      commit('clear');
      store.commit('action/clear');
      await router.push({name: routes.start});
    },
    startBalanceUpdating({state, commit}) {
      commit('setAutoUpdateOn');
      commit('nextAutoUpdateEpoch');
      return _.updateBalanceEndless(state.autoUpdateEpoch, commit, state);
    },
    changeNetwork: async ({commit}, network) => {
      store.commit('globalError/clearText');
      return BackgroundApi.request(changeNetworkTask, {network})
        .then(() => {
          store.dispatch('wallet/startBalanceUpdating');
          commit('setNetwork', network);
        })
        .catch(() => {
          store.commit('globalError/setText', 'Failure during network changing.');
        });
    },
    changeWallet: async ({commit, state}, walletKey) => {
      const walletId = state.wallets[Object.keys(state.wallets)[walletKey]].id;
      store.commit('globalError/clearText');
      BackgroundApi.request(changeWalletTask, {walletId})
        .then(() => {
          commit('setWallet', walletId);
          router.push({name: routes.wallet});
        })
        .catch((err) => {
          console.error(err);
          store.commit('globalError/setText', 'Failure during wallet changing.');
        });
    },
    wakeup: async ({commit}, page) => {
      return BackgroundApi.request(getWakeUpDataTask)
        .then((sleepState) => {
          // console.log({sleepState});
          commit('applySleepState', sleepState);
          store.commit('action/setTasks', sleepState.tasks);
          store.commit('sites/setSites', sleepState.sites);
          if (store.getters['wallet/isLoggedIn']) {
            store.dispatch('wallet/enterWallet', page || sleepState.page);
          }
        });
    },
    initTransfer: async (tools, {networkId}) => {
      store.commit('globalError/clearText');
      return BackgroundApi.request(initUiTransferTask, {networkId})
        .then((tasks) => {
          store.commit('action/setTasks', tasks);
        })
        .catch(() => {
          store.commit('globalError/setText', 'Failure during transaction initialization.');
        });
    },
    thatsMyAddress: async ({commit}) => {
      commit('thatsMyAddress');
      await BackgroundApi.request(thatsMyAddressTask);
    },
  },
  getters: {
    isLoggedIn: (state) => null !== state.wallets && Object.keys(state.wallets).length > 0,
    balanceView: (state) => {
      const balanceRaw = state.wallets[state.walletId].networks[state.network].balance;
      if (null === balanceRaw) {
        return null;
      }
      return walletLib.convertFromNano(balanceRaw, 3);
    },
    address: (state) => {
      return state.wallets[state.walletId].address;
    },
    accountName: (state) => {
      return state.wallets[state.walletId].name;
    },
    server: (state) => state.networks[state.network].server,
    isDevNetwork: (state) => state.networks[state.network].isDev,
    explorer: (state) => state.networks[state.network].explorer,
    isAddressAvailableInExplorer: (state) => _.hasContract(state) || _.isBalancePositive(state),
    isTransferAvailable: (state) => _.isBalancePositive(state),
    isItYourAddressShowing: (state) => {
      const wallet = state.wallets[state.walletId];
      const isOwnerUnknown = null === wallet.isWalletMine;
      const isCodeHashNull = wallet.networks[state.network].codeHash === null;
      const isZeroBalance = wallet.networks[state.network].balance === 0;
      return state.isAddressDataGotOnce && wallet.isRestored && isOwnerUnknown && isCodeHashNull && isZeroBalance;
    },
    isKeysEncrypted: (state) => state.wallets[state.walletId].isKeysEncrypted,
  }
}
