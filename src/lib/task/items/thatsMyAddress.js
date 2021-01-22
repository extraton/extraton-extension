import {walletRepository} from "@/db/repository/walletRepository";

export default {
  name: 'thatsMyAddress',
  handle: async function () {
    const wallet = await walletRepository.getCurrent();
    await walletRepository.setWalletIsMine(wallet);
  }
}
