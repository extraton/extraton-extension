import store from "@/store";

export default {
  name: 'createNewEmptyTokenWallet',
  handle: async function (tokens) {
    store.commit('token/setTokens', tokens);
  }
}
