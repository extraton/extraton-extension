import database from '@/db';

const interactiveTaskStatus = {
  new: 1,
  cancellation: 2,
  canceled: 3,
  process: 4,
  performed: 5,
};

const interactiveTaskType = {
  deployWalletContract: 1,
  uiTransfer: 2,
};

const interactiveTaskRepository = {
  async createTask(typeId, networkId) {
    const db = await database.getClient();
    let task = {typeId, networkId, statusId: interactiveTaskStatus.new, error: null, form: {}};
    task.id = await db.interactiveTask.add(task);
    return task;
  },
  async getActiveTasks() {
    const db = await database.getClient();
    const activeStatusIds = [
      interactiveTaskStatus.new,
      interactiveTaskStatus.cancellation,
      interactiveTaskStatus.process,
    ];
    return db.interactiveTask.where('statusId').anyOf(activeStatusIds).sortBy('id');
  },
  async getTask(taskId) {
    const db = await database.getClient();
    return await db.interactiveTask.get(taskId);
  },
  async updateTasks(tasks) {
    const db = await database.getClient();
    await db.transaction('rw', db.interactiveTask, async () => {
      for (let i in tasks) {
        await db.interactiveTask.put(tasks[i]);
      }
    });
  }
};

export {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
};