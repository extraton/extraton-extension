import database from '@/db';
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";
import {walletRepository} from "@/db/repository/walletRepository";
import {paramRepository} from "@/db/repository/paramRepository";

const _ = {
  async getSettings(/*db*/) {

    return {};
  },
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
    const walletId = await paramRepository.getParam('wallet');
    const network = await paramRepository.getParam('network');
    const pass = await paramRepository.getParam('pass');
    const isPasswordSet = null !== pass;
    const page = await _.getPage(db);
    const tasks = await interactiveTaskRepository.getAll();
    const settings = await _.getSettings(db);

    const data = {
      wallets,
      walletId,
      network,
      tasks,
      networks,
      settings,
      page,
      isPasswordSet,
    };

    return data;
  }
}
