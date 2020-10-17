import database from '@/db';

const interactiveTaskType = {
  deployWalletContract: 1,
  uiTransfer: 2,
};

const interactiveTaskRepository = {
  async createTask(type) {
    const db = await database.getClient();
    let task = {type};
    console.log(task);
    task.id = await db.interactiveTask.add(task);
    return task;
  },
  async getTasks() {
    const db = await database.getClient();
    return db.interactiveTask.orderBy('id').toArray();
  }
};

export {
  interactiveTaskType,
  interactiveTaskRepository,
};