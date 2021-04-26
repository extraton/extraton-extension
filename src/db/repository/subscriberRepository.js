import database from '@/db';

const subscriberRepository = {
  async create(tabId) {
    const db = await database.getClient();
    let subscriber = {tabId};
    subscriber.id = await db.subscriber.add(subscriber);
    return subscriber;
  },
  async remove(tabId) {
    const db = await database.getClient();
    await db.subscriber.where('tabId').equals(tabId).delete();
  },
  async findByTabId(tabId) {
    const db = await database.getClient();
    const subscribers = await db.subscriber.where({tabId}).toArray();
    return subscribers.length > 0 ? subscribers[0] : null;
  },
  async getAll() {
    const db = await database.getClient();
    return db.subscriber.toArray();
  },
};

export {
  subscriberRepository,
};
