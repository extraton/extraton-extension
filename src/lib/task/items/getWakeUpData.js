import database from '@/db';
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";
import {walletRepository} from "@/db/repository/walletRepository";

export default {
  name: 'getWakeUpData',
  handle: async function () {
    const db = await database.getClient();
    let networks = {};
    await db.network.orderBy('id').each(network => networks[network.id] = network);
    const wallets = await walletRepository.getAllWithoutKeys();
    const walletId = (await db.param.get('wallet')).value;
    const network = (await db.param.get('network')).value;
    const tasks = await interactiveTaskRepository.getAll();

    const data = {
      wallets,
      walletId,
      network,
      tasks,
      networks,
    };
    return data;
  }
}
