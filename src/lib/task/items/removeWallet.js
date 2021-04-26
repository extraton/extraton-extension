import {walletRepository} from '@/db/repository/walletRepository';
import walletLib from "@/lib/wallet";

export default {
  name: 'removeWallet',
  handle: async function (task) {
    const {walletId} = task.data;
    await walletRepository.remove(walletId);
    const wallets = await walletRepository.getAllWithoutKeys();
    const currentWalletId = wallets[Object.keys(wallets)[0]].id;
    await walletLib.changeWallet(currentWalletId);
    return {wallets, walletId: currentWalletId};
  }
}
