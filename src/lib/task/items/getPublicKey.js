import {walletRepository} from "@/db/repository/walletRepository";

export default {
  name: 'getPublicKey',
  isLoginRequired: true,
  handle: async function () {
    const wallet = await walletRepository.getCurrent();
    return wallet.keys.public;
  }
}
