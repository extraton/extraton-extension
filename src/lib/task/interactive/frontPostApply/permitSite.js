import store from "@/store";

export default {
  name: 'permitSite',
  handle: async function (sites) {
    store.commit('sites/setSites', sites);
  }
}
