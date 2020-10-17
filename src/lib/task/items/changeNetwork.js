import database from '@/db';

export default {
  name: 'changeNetwork',
  handle: async function ({network}) {
    const db = await database.getClient();
    await db.param.update('network', {value: network});
  }
}