import database from '@/db';

const paramRepository = {
  async createOrUpdate(key, value) {
    const db = await database.getClient();
    const param = await db.param.get(key);
    if (typeof param === 'undefined') {
      await db.param.add({key, value});
    } else {
      await db.param.update(key, {value});
    }
  },
  async getParam(key) {
    const db = await database.getClient();
    const param = await db.param.get(key);
    return typeof param === 'undefined' ? null : param.value;
  },
};

export {
  paramRepository,
};
