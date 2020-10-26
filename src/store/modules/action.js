import Vue from 'vue';
import {interactiveTaskStatus, interactiveTaskActiveStatusIds} from '@/db/repository/interactiveTaskRepository';
import BackgroundApi from "@/api/background";
import {
  cancelInteractiveTaskTask,
  applyInteractiveTaskTask,
  saveFormInteractiveTaskTask,
  requestInteractiveTasksTask,
} from "@/lib/task/items";

const _ = {
  findCurrentTask(tasks) {
    const taskArraySortedById = Object.entries(tasks).sort((a, b) => (a.id - 0) - (b.id - 0));
    // eslint-disable-next-line no-unused-vars
    for (const [id, task] of taskArraySortedById) {
      if (interactiveTaskActiveStatusIds.includes(task.statusId)) {
        return task;
      }
    }
    return null;
  },
  hasCurrentTaskStatus(tasks, statusId) {
    const task = this.findCurrentTask(tasks);
    if (null !== task) {
      if (task.statusId === statusId) {
        return true;
      }
    }
    return false;
  },
  countTasks(tasks, onlyActive = false) {
    let num = 0;
    if (onlyActive) {
      // eslint-disable-next-line no-unused-vars
      for (const [id, task] of Object.entries(tasks)) {
        if (interactiveTaskActiveStatusIds.includes(task.statusId)) {
          num++;
        }
      }
    } else {
      num = Object.entries(tasks).length;
    }
    return num;
  },
  updateTaskEndless: async function (commit, state) {
    try {
      const tasks = await BackgroundApi.request(requestInteractiveTasksTask);
      console.log(tasks);
      commit('setTasks', tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(async function () {
        await this.updateTaskEndless(commit, state);
      }.bind(this), 1000);
    }
  },
};

export default {
  namespaced: true,
  state: {
    tasks: {},
  },
  mutations: {
    setTasks: (state, tasks) => {
      for (const [id, task] of Object.entries(tasks)) {
        if (undefined === state.tasks[id]) {
          Vue.set(state.tasks, id, task)
        } else {
          // Vue.set(state.tasks[id], 'statusId', task.statusId)
          // Vue.set(state.tasks[id], 'result', task.result)
          // Vue.set(state.tasks[id], 'error', task.error)
          state.tasks[id].statusId = task.statusId;
          state.tasks[id].result = task.result;
          state.tasks[id].error = task.error;
        }
      }
    },
    setCurrentTaskCancellation: (state) => {
      const taskId = _.findCurrentTask(state.tasks).id;
      state.tasks[taskId].statusId = interactiveTaskStatus.cancellation;
    },
    setCurrentTaskProcess: (state) => {
      const taskId = _.findCurrentTask(state.tasks).id;
      state.tasks[taskId].statusId = interactiveTaskStatus.process;
      state.tasks[taskId].error = null;
    },
    clear: (state) => {
      state.tasks = {};
    },
  },
  actions: {
    cancel({commit}, interactiveTaskId) {
      commit('setCurrentTaskCancellation');
      return BackgroundApi.request(cancelInteractiveTaskTask, {interactiveTaskId})
        .then((tasks) => {
          commit('setTasks', tasks);
        });
    },
    apply({commit, state}, {interactiveTaskId}) {
      commit('setCurrentTaskProcess');
      const form = state.tasks[interactiveTaskId].form;
      return BackgroundApi.request(applyInteractiveTaskTask, {interactiveTaskId, form})
        .then((tasks) => {
          commit('setTasks', tasks);
        });
    },
    formChange({state}, form) {
      const taskId = _.findCurrentTask(state.tasks).id;
      state.tasks[taskId].form = form;
      return BackgroundApi.request(saveFormInteractiveTaskTask, {interactiveTaskId: state.tasks[taskId].id, form});
    },
    startTaskUpdating({commit, state}) {
      return _.updateTaskEndless(commit, state);
    }
  },
  getters: {
    isDialogShowing: (state) => _.countTasks(state.tasks, true) > 0,
    currentTask: (state) => _.findCurrentTask(state.tasks),
    activeTasksAmount: (state) => _.countTasks(state.tasks, true),
    isCancelButtonEnabled: (state) => _.hasCurrentTaskStatus(state.tasks, interactiveTaskStatus.new),
    isCancelButtonLoading: (state) => _.hasCurrentTaskStatus(state.tasks, interactiveTaskStatus.cancellation),
    isApplyButtonEnabled: (state) => _.hasCurrentTaskStatus(state.tasks, interactiveTaskStatus.new),
    isApplyButtonLoading: (state) => _.hasCurrentTaskStatus(state.tasks, interactiveTaskStatus.process),
  },
}
