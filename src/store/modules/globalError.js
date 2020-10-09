export default {
  namespaced: true,
  state: {
    text: null,
  },
  mutations: {
    setText: (state, text) => {
      state.text = text
    },
    clearText: (state) => {
      state.text = null
    },
  },
}
