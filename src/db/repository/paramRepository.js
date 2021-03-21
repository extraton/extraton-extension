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
  }
};

export {
  paramRepository,
};
