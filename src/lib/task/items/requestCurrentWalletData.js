import database from '@/db';
import {walletRepository} from "@/db/repository/walletRepository";
import tonLib from "@/api/tonSdk";

export default {
  name: 'requestCurrentWalletData',
  handle: async function () {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    let network = await db.network.get(networkId);
    const wallet = await walletRepository.getCurrent();
    const accountData = await tonLib.requestAccountData(network.server, wallet.address);
    let walletBalance = "0";
    let walletCodeHash = null;
    if (null !== accountData) {
      walletBalance = accountData.balance;
      walletCodeHash = accountData.code_hash;
    }
    await walletRepository.updateNetworkData(wallet, networkId, walletBalance, walletCodeHash);

    return {walletId: wallet.id, networkId, data: wallet.networks[networkId]};
  }
}
