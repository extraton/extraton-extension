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
  async get(key) {
    const db = await database.getClient();
    const params = await db.param.where({key}).toArray();
    if (0 === params.length) {
      throw `Param '${key}' not found`;
    }
    return params[0].value;
  },
  async find(key) {
    const db = await database.getClient();
    const params = await db.param.where({key}).toArray();
    return params.length > 0 ? params[0].value : null;
  },
};

export {
  paramRepository,
};
