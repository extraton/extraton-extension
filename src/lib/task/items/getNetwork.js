import database from "@/db";

export default {
  name: 'getNetwork',
  handle: async function () {
    const db = await database.getClient();
    const network = (await db.param.get('network')).value;
    return {id: network};
  }
}