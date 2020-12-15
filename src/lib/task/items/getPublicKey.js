import database from "@/db";

export default {
  name: 'getPublicKey',
  handle: async function () {
    const db = await database.getClient();
    const keys = (await db.param.get('keys')).value;
    return keys.public;
  }
}
