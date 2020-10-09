import TonApi from '@/api/ton';
import StorageApi from '@/api/storage';
import {router, routes} from "@/plugins/router";
import store from "@/store";

const STORAGE_KEY = 'wallet';
const saveSleepState = (state) => {
  let sleepState = {};
  sleepState.keys = null !== state.keys ? Object.assign({}, state.keys) : null;
  sleepState.address = state.address;
  sleepState.balance = null !== state.balance ? state.balance.toString(): null;
  sleepState.isActive = state.isActive;
  sleepState.network = state.network;
  sleepState.isAutoUpdateOn = state.isAutoUpdateOn;
  StorageApi.set(STORAGE_KEY, sleepState);
};
const removeSleepState = () => {
  StorageApi.remove(STORAGE_KEY);
};

//@TODO try this https://github.com/robinvdvleuten/vuex-persistedstate
const requestAccountData = async function (epoch, commit, state) {
  //@TODO refactoring
  if (state.isAutoUpdateOn && epoch === state.autoUpdateEpoch) {
    try {
      const server = store.getters['wallet/server'];
      if (null === state.address) {
        const address = await TonApi.predictAddress(server, state.keys.public)
        commit('setAddress', address);
      }
      const data = await TonApi.requestAccountData(server, state.address)
      console.log({accountData: data});
      //@TODO refactoring
      if (state.isAutoUpdateOn && epoch === state.autoUpdateEpoch) {
        let balance = 0;
        if (null !== data) {
          balance = data.balance;
          commit('setIsActive');
        }
        commit('setBalance', balance);
        setTimeout(async () => {
          await requestAccountData(epoch, commit, state);
        }, 5000);
      }
    } catch (err) {
      store.commit('globalError/setText', 'Failure during account data requesting.');
      console.log(err);
    }
  }
};

export default {
  namespaced: true,
  state: {
    keys: null,
    address: null,
    balance: null,
    isActive: false,
    networks: [
      {server: 'main.ton.dev', explorer: 'ton.live', info: 'The main network', isDev: false},
      {server: 'net.ton.dev', explorer: 'net.ton.live', info: 'Test network', isDev: true},
    ],
    network: 0,
    isAutoUpdateOn: false,
    autoUpdateEpoch: 0,
  },
  mutations: {
    setKeys: (state, keys) => {
      state.keys = keys;
      saveSleepState(state);
    },
    setAddress: (state, address) => {
      state.address = address;
      saveSleepState(state);
    },
    setBalance: (state, balance) => {
      state.balance = BigInt(balance);
      saveSleepState(state);
    },
    nullBalance: (state) => {
      state.balance = null;
      saveSleepState(state);
    },
    setNetwork: (state, network) => {
      state.network = network;
      saveSleepState(state);
    },
    setIsActive: (state) => {
      state.isActive = true;
      saveSleepState(state);
    },
    unsetIsActive: (state) => {
      state.isActive = false;
      saveSleepState(state);
    },
    offAutoUpdate: (state) => {
      state.isAutoUpdateOn = false;
      saveSleepState(state);
    },
    onAutoUpdate: (state) => {
      state.isAutoUpdateOn = true;
      saveSleepState(state);
    },
    nextAutoUpdateEpoch: (state) => {
      state.autoUpdateEpoch += 1;
      saveSleepState(state);
    },
    clear: (state) => {
      state.keys = null;
      state.address = null;
      state.balance = null;
      state.isActive = false;
      state.network = 0;
      state.isAutoUpdateOn = false;
      removeSleepState();
    },
    applySleepState: (state, sleepState) => {
      state.keys = sleepState.keys;
      state.address = sleepState.address;
      state.balance = null !== sleepState.balance ? BigInt(sleepState.balance) : null;
      state.isActive = sleepState.isActive;
      state.network = sleepState.network;
      state.isAutoUpdateOn = sleepState.isAutoUpdateOn;
    }
  },
  actions: {
    enterWallet: () => router.push({name: routes.wallet}),
    goToStart: () => router.push({name: routes.start}),
    logout: ({commit}) => {
      commit('clear');
      router.push({name: routes.start});
    },
    turnOnAutoUpdate: async ({commit, state}) => {
      commit('nextAutoUpdateEpoch');
      commit('onAutoUpdate');
      await requestAccountData(state.autoUpdateEpoch, commit, state);
    },
    changeNetwork: ({commit}, network) => {
      commit('offAutoUpdate');
      commit('nullBalance');
      commit('unsetIsActive');
      commit('setNetwork', network);
      store.dispatch('wallet/turnOnAutoUpdate');
    },
    wakeup: ({commit}, sleepState) => {
      commit('applySleepState', sleepState);
    }
  },
  getters: {
    isLoggedIn: (state) => state.keys !== null,
    addressView: (state) => null !== state.address
      ? `${state.address.substr(0, 8)}...${state.address.substr(-6)}`
      : null,
    balanceView: (state) => {
      if (null === state.balance) {
        return null
      }
      const integer = state.balance / BigInt('1000000000');
      const reminderStr = (state.balance % BigInt('1000000000')).toString();
      const decimalStr = `${'0'.repeat(9 - reminderStr.length)}${reminderStr}`;
      const decimalCut = decimalStr.substr(0, 3);
      const integerFormatted = integer.toLocaleString();
      return `${integerFormatted}.${decimalCut}`;
    },
    server: (state) => state.networks[state.network].server,
    isDevNetwork: (state) => state.networks[state.network].isDev,
    explorerLink: (state) => `https://${state.networks[state.network].explorer}/accounts?section=details&id=${state.address}`,
  }
}
