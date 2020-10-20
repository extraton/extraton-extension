import {interactiveTaskStatus} from '@/db/repository/interactiveTaskRepository';
import BackgroundApi from "@/api/background";
import {
  cancelInteractiveTaskTask,
  applyInteractiveTaskTask,
  saveFormInteractiveTaskTask,
} from "@/lib/task/items";

export default {
  namespaced: true,
  state: {
    tasks: [],
  },
  mutations: {
    setTasks: (state, tasks) => state.tasks = tasks,
    setCurrentTaskCancellation: (state) => state.tasks[0].statusId = interactiveTaskStatus.cancellation,
    setCurrentTaskProcess: (state) => {
      state.tasks[0].statusId = interactiveTaskStatus.process;
      state.tasks[0].error = null;
    },
  },
  actions: {
    cancel({commit}, taskId) {
      commit('setCurrentTaskCancellation');
      return BackgroundApi.request(cancelInteractiveTaskTask, {taskId})
        .then((tasks) => {
          commit('setTasks', tasks);
        });
    },
    apply({commit, state}, {taskId}) {
      commit('setCurrentTaskProcess');
      const form = state.tasks[0].form;
      return BackgroundApi.request(applyInteractiveTaskTask, {taskId, form})
        .then((tasks) => {
          commit('setTasks', tasks);
        });
    },
    formChange({state}, form) {
      state.tasks[0].form = form;
      return BackgroundApi.request(saveFormInteractiveTaskTask, {taskId: state.tasks[0].id, form});
    }
  },
  getters: {
    isDialogShowing: (state) => state.tasks.length > 0,
    currentTask: (state) => state.tasks.length > 0 ? state.tasks[0] : null,
    tasksAmount: (state) => state.tasks.length,
    isCancelButtonEnabled: (state) => state.tasks.length > 0 && state.tasks[0].statusId === interactiveTaskStatus.new,
    isCancelButtonLoading: (state) => state.tasks.length > 0 && state.tasks[0].statusId === interactiveTaskStatus.cancellation,
    isApplyButtonEnabled: (state) => state.tasks.length > 0 && state.tasks[0].statusId === interactiveTaskStatus.new,
    isApplyButtonLoading: (state) => state.tasks.length > 0 && state.tasks[0].statusId === interactiveTaskStatus.process,
  },
}
