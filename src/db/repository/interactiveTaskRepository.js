import database from '@/db';

const _ = {
  indexEntitiesByField(entities, field) {
    let result = {};
    // console.log(entities);
    for (const element of entities) {
      result[element[field]] = element;
    }
    return result;
  }
};

const interactiveTaskStatus = {
  new: 1,
  cancellation: 2,
  canceled: 3,
  process: 4,
  performed: 5,
  unknown: 6,
};

const interactiveTaskActiveStatusIds = [
  interactiveTaskStatus.new,
  interactiveTaskStatus.cancellation,
  interactiveTaskStatus.process,
];

const interactiveTaskType = {
  deployWalletContract: 1,
  uiTransfer: 2,
  preDeployTransfer: 3,
  deployContract: 4,
  runTransaction: 5,
  transfer: 6,
  confirmTransaction: 7,
};

const interactiveTaskRepository = {
  async createTask(typeId, networkId, requestId = null, params = {}, data = {}) {
    const db = await database.getClient();
    let task = {
      typeId,
      networkId,
      requestId,
      data,
      params,
      statusId: interactiveTaskStatus.new,
      error: null,
      form: {}
    };
    task.id = await db.interactiveTask.add(task);
    return task;
  },
  async getActiveTasks() {
    const db = await database.getClient();
    const tasks = await db.interactiveTask.where('statusId').anyOf(interactiveTaskActiveStatusIds).sortBy('id');
    return _.indexEntitiesByField(tasks, 'id');
  },
  async getAll() {
    const db = await database.getClient();
    const tasks = await db.interactiveTask.orderBy('id').toArray();
    return _.indexEntitiesByField(tasks, 'id');
  },
  async getTask(taskId) {
    const db = await database.getClient();
    return await db.interactiveTask.get(taskId);
  },
  async isOneOfTaskByRequestIdCanceled(requestId) {
    const db = await database.getClient();
    const tasksNum = await db.interactiveTask
      .where({requestId, statusId: interactiveTaskStatus.canceled})
      .count();
    return tasksNum > 0;
  },
  async updateTasks(tasks) {
    const db = await database.getClient();
    await db.transaction('rw', db.interactiveTask, async () => {
      for (let i in tasks) {
        await db.interactiveTask.put(tasks[i]);
      }
    });
  },
  async makeProcessTasksUnknown() {
    const db = await database.getClient();
    await db.interactiveTask.where("statusId").equals(interactiveTaskStatus.process)
      .modify({statusId: interactiveTaskStatus.unknown});
  }
};

export {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskActiveStatusIds,
  interactiveTaskRepository,
};
