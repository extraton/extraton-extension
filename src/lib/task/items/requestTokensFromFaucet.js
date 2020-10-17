import TonApi from '@/api/ton';
import database from "@/db";

const gruntAbi = require('@/contracts/Grunt.abi.json');

export default {
  name: 'requestTokensFromFaucet',
  handle: async function ({network}) {
    const db = await database.getClient();
    const net = await db.network.get(network);
    net.faucet.isGettingTokens = true;
    await db.network.update(network, {faucet: net.faucet});

    try {
      const address = (await db.param.get('address')).value;
      await TonApi.run(net.server, net.faucet.address, 'grant', gruntAbi, {addr: address});
      net.faucet.isAvailable = false;
    } finally {
      net.faucet.isGettingTokens = false;
      await db.network.update(network, {faucet: net.faucet});
    }
  },
}
