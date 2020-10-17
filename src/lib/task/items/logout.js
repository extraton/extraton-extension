import database from '@/db';

export default {
  name: 'logout',
  handle: async function () {
    const db = await database.getClient();
    await db.delete();
  }
}