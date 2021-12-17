import database from '@/db';
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";
import {walletRepository} from "@/db/repository/walletRepository";
import {paramRepository} from "@/db/repository/paramRepository";
import {siteRepository} from "../../../db/repository/siteRepository";

const _ = {
  async getPage(db) {
    // await db.param.delete('page');
    let page = await db.param.get('page');
    page = typeof page !== 'undefined' ? page.value : null;
    return page;
  },
}

export default {
  name: 'getWakeUpData',
  handle: async function () {
    const db = await database.getClient();
    let networks = {};
    await db.network.orderBy('id').each(network => networks[network.id] = network);
    const wallets = await walletRepository.getAllWithoutKeys();
    const walletId = await paramRepository.get('wallet');
    const network = await paramRepository.get('network');
    const page = await _.getPage(db);
    const tasks = await interactiveTaskRepository.getAll();
    const sites = await siteRepository.getAll();

    return {
      wallets,
      walletId,
      network,
      tasks,
      networks,
      sites,
      page,
    };
  }
}
