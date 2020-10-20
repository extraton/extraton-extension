import database from '@/db';
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";

export default {
  name: 'getWakeUpData',
  handle: async function () {
    const db = await database.getClient();
    let networks = {};
    await db.network.orderBy('id').each(network => networks[network.id] = network);
    return {
      address: (await db.param.get('address')).value,
      network: (await db.param.get('network')).value,
      tasks: await interactiveTaskRepository.getActiveTasks(),
      networks,
    };
  }
}