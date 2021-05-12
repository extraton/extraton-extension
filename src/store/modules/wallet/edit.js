import BackgroundApi from "@/api/background";
import {removeWalletTask, editWalletTask} from "@/lib/task/items";
import store from "@/store";

export default {
  namespaced: true,
  state: {
    isDialogShowing: false,
    isSaving: false,
    isDeleting: false,
    wallets: {},
    wallet: null,
    name: '',
  },
  mutations: {
    setIsSaving: (state, value) => {
      state.isSaving = value;
    },
    setIsDeleting: (state, value) => {
      state.isDeleting = value;
    },
    startEditing: (state, {wallets, wallet}) => {
      state.wallets = wallets;
      state.wallet = wallet;
      state.isSaving = false;
      state.isDeleting = false;
      state.isDialogShowing = true;
      state.name = wallet.name;
    },
    endEditing: (state) => {
      if (!state.isSaving && !state.isDeleting) {
        state.wallet = null;
        state.isDialogShowing = false;
      }
    },
    inputName (state, name) {
      state.name = name;
    },
    commitWalletName (state) {
      state.wallet.name = state.name;
    }
  },
  actions: {
    saveWallet: async ({commit, state}) => {
      commit('setIsSaving', true);
      BackgroundApi.request(editWalletTask, {walletId: state.wallet.id, walletName: state.name})
        .then(() => {
          commit('commitWalletName');
          commit('setIsSaving', false);
          commit('endEditing');
        })
        .catch((err) => {
          commit('setIsSaving', false);
          console.error(err);
          store.commit('globalError/setText', store.state.app.i18n.t('globalError.walletEditing'));
        });
      commit('endEditing');
    },
    removeWallet: async ({commit, state}) => {
      commit('setIsDeleting', true);
      BackgroundApi.request(removeWalletTask, {walletId: state.wallet.id})
        .then(({wallets, walletId}) => {
          store.commit('wallet/setWalletsAfterRemoving', {wallets, walletId});
          commit('setIsDeleting', false);
          commit('endEditing');
        })
        .catch((err) => {
          commit('setIsDeleting', false);
          console.error(err);
          store.commit('globalError/setText', store.state.app.i18n.t('globalError.walletRemoving'));
        });
    },
  },
  getters: {
    isMoreThanOneWallet: (state) => null !== state.wallets && Object.keys(state.wallets).length > 1,
  },
}
