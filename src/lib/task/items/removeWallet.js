import {walletRepository} from '@/db/repository/walletRepository';
import database from "@/db";

export default {
  name: 'removeWallet',
  handle: async function (i18n, task) {
    const db = await database.getClient();
    const {walletId} = task.data;
    await walletRepository.remove(walletId);
    const wallets = await walletRepository.getAllWithoutKeys();
    const currentWalletId = wallets[Object.keys(wallets)[0]].id;
    await db.param.update('wallet', {value: currentWalletId});
    return {wallets, walletId: currentWalletId};
  }
}
