import database from '@/db';

export default {
  name: 'setSetting',
  handle: async function (task) {
    const {name, value} = task.data;
    const db = await database.getClient();
    //@TODO list of available to change parameters
    const setting = await db.param.get(name);
    if (typeof setting === 'undefined') {
      await db.param.add({key: name, value});
    } else {
      await db.param.update(name, {value});
    }
  }
}
