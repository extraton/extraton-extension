import BackgroundApi from "@/api/background";
import {removeSiteTask} from "@/lib/task/items";
import store from "@/store";

export default {
  namespaced: true,
  state: {
    sites: [],
  },
  mutations: {
    setSites: (state, sites) => {
      state.sites = sites;
    },
  },
  actions: {
    remove: async ({commit}, id) => {
      store.commit('globalError/clearText');
      BackgroundApi.request(removeSiteTask, {id})
        .then(({sites}) => {
          commit('setSites', sites);
        })
        .catch((err) => {
          console.error(err);
          store.commit('globalError/setText', 'Failure during remove site.');
        });
    },
  },
  getters: {
    // sites: ({sites}) => (networkId, walletId) => sites.filter(e => {console.log(networkId, walletId); return e.networkId === networkId && e.walletId === walletId}),
  },
}
