import TonApi from '@/api/ton';
import store from '@/store'

const convertSeedToKeys = async function (seed, commit) {
  try {
    const keys = await TonApi.convertSeedToKeys(store.getters['wallet/server'], seed)
    commit('setKeys', keys);
  } catch (err) {
    console.log(err);
    throw(err);
  }
}

export default {
  namespaced: true,
  state: {
    seed: null,
    keys: null,
  },
  mutations: {
    setSeed: (state, seed) => {
      state.seed = seed
    },
    setKeys: (state, keys) => {
      state.keys = keys
    },
    clear: (state) => {
      state.seed = null;
      state.keys = null;
    },
  },
  actions: {
    generateSeed: ({commit}) => {
      return TonApi.generateSeed(store.getters['wallet/server']).then(function (seed) {
        commit('setSeed', seed);
      }.bind(this)).catch((err) => {
        console.log(err);
        throw err;
      });
    },
    convertSeedToKeys: async ({commit, state}) => convertSeedToKeys(state.seed, commit),
    restoreKeys: async ({commit}, seed) => {
      return convertSeedToKeys(seed, commit).catch((err) => {
        const message = err.code === 2017
          ? 'Invalid seed phrase.'
          : 'Failure during seed validation.';
        throw new Error(message);
      });
    }
  },
}
