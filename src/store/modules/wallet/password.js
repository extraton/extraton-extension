const initialState = {
  isDialogShowing: false,
  password: null,
  resolve: null,
  reject: null,
};

export default {
  namespaced: true,
  state: Object.assign({}, initialState),
  mutations: {
    init: (state, payload) => Object.assign(state, payload),
    onPasswordChange: (state, v) => state.password = v,
    confirm: (state) => {
      state.resolve(state.password);
      state = Object.assign(state, initialState);
    },
    cancel: (state) => {
      state.reject();
      state = Object.assign(state, initialState);
    },
  },
  actions: {
    ask: ({commit}) => {
      return new Promise((resolve, reject) => {
        commit('init', {
          isDialogShowing: true,
          resolve,
          reject
        })
      })
    }
  },
  getters: {},
}
