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

const networkRepository = {
  async getAll() {
    const db = await database.getClient();
    const networks = await db.network.orderBy('id').toArray();
    return _.indexEntitiesByField(networks, 'id');
  },
  async getById(id) {
    const db = await database.getClient();
    return await db.network.get(id);
  }
};

export {
  networkRepository,
};
