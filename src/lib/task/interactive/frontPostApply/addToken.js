import store from "@/store";
import {router, routes} from "@/plugins/router";

export default {
  name: 'addToken',
  handle: async function (tokens, tokenId) {
    store.commit('token/setTokens', tokens);
    await router.push({name: routes.walletToken, params: {id: tokenId}});
  }
}
