import {walletRepository} from "@/db/repository/walletRepository";

export default {
  name: 'editWallet',
  handle: async function (task) {
    const {walletId, walletName} = task.data;
    let wallet = await walletRepository.getById(walletId);
    wallet.name = walletName;
    await walletRepository.updateName(wallet);
  }
}
