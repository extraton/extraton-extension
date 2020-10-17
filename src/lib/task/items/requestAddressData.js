import database from '@/db';
import TonApi from '@/api/ton';

export default {
  name: 'requestAddressData',
  handle: async function () {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const address = (await db.param.get('address')).value;
    let network = await db.network.get(networkId);
    const data = await TonApi.requestAccountData(network.server, address);

    console.log(data);

    network.account.balance = null !== data ? data.balance : 0;
    network.account.codeHash = null !== data ? data.code_hash : null;
    await db.network.update(network, {account: network.account});

    return {networkId, account: network.account,};
  }
}