import database from '@/db';
import {interactiveTaskRepository} from "@/db/repository/interactiveTaskRepository";
import {walletRepository} from "@/db/repository/walletRepository";
import {tokenRepository} from "@/db/repository/tokenRepository";
import {paramRepository} from "@/db/repository/paramRepository";

const _ = {
  async getSettings(db) {
    let tip3 = await db.param.get('tip3');
    let hideAddrCopyWarning = await db.param.get('hideAddrCopyWarning');
    tip3 = typeof tip3 !== 'undefined' ? tip3.value : false;
    hideAddrCopyWarning = typeof hideAddrCopyWarning !== 'undefined' ? hideAddrCopyWarning.value : false;

    return {tip3, hideAddrCopyWarning};
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
    const walletId = await paramRepository.get('wallet');
    const network = await paramRepository.get('network');
    const page = await _.getPage(db);
    const tasks = await interactiveTaskRepository.getAll();
    const tokens = await tokenRepository.getAll();
    const settings = await _.getSettings(db);

    const data = {
      wallets,
      walletId,
      network,
      tasks,
      networks,
      tokens,
      settings,
      page,
    };

    return data;
  }
}
