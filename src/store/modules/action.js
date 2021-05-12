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
  hasCurrentTaskStatus(tasks, statusIds) {
    const task = this.findCurrentTask(tasks);
    return null !== task && statusIds.includes(task.statusId);
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
          state.tasks[id].statusId = task.statusId;
          state.tasks[id].result = task.result;
          state.tasks[id].error = task.error;
          state.tasks[id].preparation = task.preparation;
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
    async apply({commit, state}, {interactiveTask, password}) {
      commit('setCurrentTaskProcess');
      const form = state.tasks[interactiveTask.id].form;
      return BackgroundApi.request(applyInteractiveTaskTask, {
        interactiveTaskId: interactiveTask.id,
        password,
        form,
      }).then(async ({interactiveTasks}) => {
        commit('setTasks', interactiveTasks);
      }).catch();
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
    isCancelButtonEnabled: (state) => _.hasCurrentTaskStatus(state.tasks, [interactiveTaskStatus.new, interactiveTaskStatus.prepared]),
    isCancelButtonLoading: (state) => _.hasCurrentTaskStatus(state.tasks, [interactiveTaskStatus.cancellation]),
    isApplyButtonEnabled: (state) => _.hasCurrentTaskStatus(state.tasks, [interactiveTaskStatus.new, interactiveTaskStatus.prepared]),
    isApplyButtonLoading: (state) => _.hasCurrentTaskStatus(state.tasks, [interactiveTaskStatus.process]),
  },
}
