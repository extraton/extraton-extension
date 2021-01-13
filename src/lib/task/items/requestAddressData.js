import database from '@/db';
import TonApi from '@/api/ton';
import {walletRepository} from "@/db/repository/walletRepository";

export default {
  name: 'requestAddressData',
  handle: async function () {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    let network = await db.network.get(networkId);
    const wallet = await walletRepository.getCurrent();
    const data = await TonApi.requestAccountData(network.server, wallet.address);

    // console.log(data);

    const balance = null !== data ? data.balance : 0;
    const codeHash = null !== data ? data.code_hash : null;

    await walletRepository.updateNetworkData(wallet, networkId, balance, codeHash);

    return {walletId: wallet.id, networkId, data: wallet.networks[networkId],};
  }
}
