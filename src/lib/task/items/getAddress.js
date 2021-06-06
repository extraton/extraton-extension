import {walletRepository} from "@/db/repository/walletRepository";

export default {
  name: 'getAddress',
  isLoginRequired: true,
  handle: async function () {
    const wallet = await walletRepository.getCurrent();
    return wallet.address;
  }
}
