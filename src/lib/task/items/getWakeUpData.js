import database from '@/db';
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";

export default {
  name: 'getWakeUpData',
  handle: async function () {
    const db = await database.getClient();
    await db.param.each(param => data[param.key] = param.value);
    const data = {
      address: (await db.param.get('address')).value,
      network: (await db.param.get('network')).value,
      networks: await db.network.orderBy('id').toArray(),
      tasks: await interactiveTaskRepository.getTasks(),
    };
    return data;
  }
}