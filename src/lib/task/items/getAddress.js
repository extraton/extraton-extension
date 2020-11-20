import database from "@/db";

export default {
  name: 'getAddress',
  handle: async function () {
    const db = await database.getClient();
    return (await db.param.get('address')).value;
  }
}
