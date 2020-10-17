export default {
  namespaced: true,
  state: {
    tasks: [],
  },
  mutations: {
    setTasks(state, tasks) {
      state.tasks = tasks;
    },
  },
  actions: {
  },
  getters: {
    isDialogShowing: (state) => state.tasks.length > 0,
    currentTask: (state) => state.tasks.length > 0 ? state.tasks[0] : null,
    tasksAmount: (state) => state.tasks.length,
  },
}
