import BackgroundApi from '@/api/background';
import {router, routes} from "@/plugins/router";
import store from "@/store";
import {
  requestTokensFromFaucetTask,
  getWakeUpDataTask,
  changeNetworkTask,
  requestAddressDataTask,
  logoutTask,
  initUiTransferTask,
} from "@/lib/task/items";

const _ = {
  updateBalanceEndless: async function (epoch, commit, state) {
    if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
      try {
        const data = await BackgroundApi.request(requestAddressDataTask);
        if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
          commit('setNetworkAccountData', data);
        }
      } catch (err) {
        console.error(err);
      }
      if (state.isAutoUpdatingOn && epoch === state.autoUpdateEpoch) {
        setTimeout(async function () {
          await this.updateBalanceEndless(epoch, commit, state);
        }.bind(this), 4000);
      }
    }
  },
  isBalancePositive(state) {
    const balance = state.networks[state.network].account.balance;
    return null !== balance ? BigInt(balance) > BigInt(0) : false;
  },
  hasContract: (state) => state.networks[state.network].account.codeHash !== null,
};

export default {
  namespaced: true,
  state: {
    address: null,
    network: null,
    networks: null,
    isAutoUpdatingOn: false,
    autoUpdateEpoch: 0,
  },
  mutations: {
    setNetworkAccountData: (state, {networkId, account}) => state.networks[networkId].account = account,
    setNetwork: (state, network) => state.network = network,
    setAutoUpdateOn: (state) => state.isAutoUpdatingOn = true,
    nextAutoUpdateEpoch: (state) => state.autoUpdateEpoch += 1,
    setGettingTokensFromFaucet: (state, network) => state.networks[network].faucet.isGettingTokens = true,
    unsetGettingTokensFromFaucet: (state, network) => state.networks[network].faucet.isGettingTokens = false,
    disableFaucet: (state) => state.networks[state.network].faucet.isAvailable = false,
    clear: (state) => {
      state.address = null;
      state.network = null;
      state.networks = null;
      state.isAutoUpdatingOn = false;
    },
    applySleepState: (state, sleepState) => {
      state.address = sleepState.address;
      state.network = sleepState.network;
      state.networks = sleepState.networks;
    }
  },
  actions: {
    enterWallet: async () => {
      // let tasks = await StorageApi.get('tasks');
      // console.log({tasks});
      // if (null !== tasks) {
      //   for (let i = tasks.queue.length - 1; i >=0; i--) {
      //     let result = {requestId: tasks.queue[i].requestId};
      //     switch (tasks.queue[i].method) {
      //       case 'getNetwork':
      //         result.code = 0;
      //         result.data = {id: state.network};
      //         break;
      //       default:
      //         result.code = 1;
      //         result.error = 'Unknown task.';
      //     }
      //     tasks.queue[i].result = result;
      //     tasks.handled.push(tasks.queue[i]);
      //     tasks.queue.splice(i, 1);
      //   }
      //   await StorageApi.set('tasks', tasks);
      // }
      return router.push({name: routes.wallet})
    },
    goToStart: () => router.push({name: routes.start}),
    logout: async ({commit}) => {
      await BackgroundApi.request(logoutTask);
      commit('clear');
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
    wakeup: async ({commit}) => {
      return BackgroundApi.request(getWakeUpDataTask)
        .then((sleepState) => {
          commit('applySleepState', sleepState);
          store.commit('action/setTasks', sleepState.tasks);
          if (store.getters['wallet/isLoggedIn']) {
            store.dispatch('wallet/enterWallet');
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
    getTokensFromFaucet: async ({commit}, {snack, network}) => {
      commit('setGettingTokensFromFaucet', network);
      return BackgroundApi.request(requestTokensFromFaucetTask, {network})
        .then(() => {
          snack.success({text: 'Tokens will come in a moment.'});
          commit('disableFaucet', network);
          commit('unsetGettingTokensFromFaucet', network);
        })
        .catch(() => {
          commit('unsetGettingTokensFromFaucet', network);
          snack.danger({text: 'Error'});
        });
    },
  },
  getters: {
    isLoggedIn: (state) => state.address !== null,
    addressView: (state) => null !== state.address
      ? `${state.address.substr(0, 8)}...${state.address.substr(-6)}`
      : null,
    balanceView: (state) => {
      const balanceRaw = state.networks[state.network].account.balance;
      if (null === balanceRaw) {
        return null;
      }
      const balanceBigInt = BigInt(balanceRaw);
      const integer = balanceBigInt / BigInt('1000000000');
      const reminderStr = (balanceBigInt % BigInt('1000000000')).toString();
      const decimalStr = `${'0'.repeat(9 - reminderStr.length)}${reminderStr}`;
      const decimalCut = decimalStr.substr(0, 3);
      const integerFormatted = integer.toLocaleString();
      return `${integerFormatted}.${decimalCut}`;
    },
    server: (state) => state.networks[state.network].server,
    isDevNetwork: (state) => state.networks[state.network].isDev,
    explorerLink: (state) => `https://${state.networks[state.network].explorer}/accounts?section=details&id=${state.address}`,
    isGettingTokensFromFaucet: (state) => {
      const faucet = state.networks[state.network].faucet;
      return undefined !== faucet ? faucet.isGettingTokens : false;
    },
    isFaucetAvailable: (state) => {
      const faucet = state.networks[state.network].faucet;
      const isZeroBalance = state.networks[state.network].account.balance === 0;
      return undefined !== faucet && faucet.isAvailable === true && isZeroBalance && !_.hasContract(state);
    },
    isAddressAvailableInExplorer: (state) => _.hasContract(state) || _.isBalancePositive(state),
    isTransferAvailable: (state) => _.isBalancePositive(state),
  }
}
