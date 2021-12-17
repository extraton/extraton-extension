import database from '@/db';
import tonSdkLib from "@/api/tonSdk";
import {walletRepository} from "@/db/repository/walletRepository";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'requestCurrentWalletData',
  handle: async function () {
    const db = await database.getClient();
    const networkId = await paramRepository.get('network');
    let network = await db.network.get(networkId);
    const wallet = await walletRepository.getCurrent();
    const addresses = [wallet.address];
    const accountsData = await tonSdkLib.requestAccountsData(network.server, addresses);
    let walletBalance = "0";
    let walletCodeHash = null;
    for (const accountData of accountsData) {
      if (accountData.id === wallet.address) {
        walletBalance = accountData.balance;
        walletCodeHash = accountData.code_hash;
      }
    }
    await walletRepository.updateNetworkData(wallet, networkId, walletBalance, walletCodeHash);

    return {walletId: wallet.id, networkId, data: wallet.networks[networkId]};
  }
}
