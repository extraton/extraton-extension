import TonApi from '@/api/ton';
import database from "@/db";
import {walletRepository} from "@/db/repository/walletRepository";

const gruntAbi = require('@/contracts/Grunt.abi.json');

export default {
  name: 'requestTokensFromFaucet',
  handle: async function (task) {
    const {network} = task.data;
    const db = await database.getClient();
    const net = await db.network.get(network);
    net.faucet.isGettingTokens = true;
    await db.network.update(network, {faucet: net.faucet});

    try {
      const wallet = await walletRepository.getCurrent();
      await TonApi.run(net.server, net.faucet.address, 'grant', gruntAbi, {addr: wallet.address});
      net.faucet.isAvailable = false;
    } finally {
      net.faucet.isGettingTokens = false;
      await db.network.update(network, {faucet: net.faucet});
    }
  },
}
