import database from '@/db';

const _ = {
  indexEntitiesByField(entities, field) {
    let result = {};
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
  prepared: 5,
  performed: 6,
  unknown: 7,
};

const interactiveTaskActiveStatusIds = [
  interactiveTaskStatus.new,
  interactiveTaskStatus.cancellation,
  interactiveTaskStatus.process,
  interactiveTaskStatus.prepared,
];

const interactiveTaskType = {
  deployWalletContract: 1,
  uiTransfer: 2,
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
      form: {},
      preparation: null,
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
    // db.interactiveTask.clear();
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
