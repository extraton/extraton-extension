import database from '@/db';
import TonApi from '@/api/ton';
import {walletRepository} from "@/db/repository/walletRepository";
import {tokenRepository} from "@/db/repository/tokenRepository";
import tokenContractLib from "@/lib/token/contract";

const _ = {
  getTokenByAddress(tokens, address) {
    for (const token of tokens) {
      if (token.walletAddress === address) {
        return token;
      }
    }
    throw 'Token not found';
  },
  async checkTokenAddress(server, token, publicKey) {
    const contract = tokenContractLib.getContractById(token.contractId);
    const address = await contract.fetchWalletAddress(server, token, publicKey);
    if (null !== address) {
      token.walletAddress = address;
      token.isDeploying = false;
      await tokenRepository.setIsDeploying(token);
      await tokenRepository.updateWalletAddress(token);
    }
  }
}

export default {
  name: 'requestCurrentWalletData',
  handle: async function () {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    let network = await db.network.get(networkId);
    const wallet = await walletRepository.getCurrent();
    const walletTokens = await tokenRepository.getByWalletAndNetwork(wallet.id, network.id);
    const addresses = [wallet.address];
    for (const walletToken of walletTokens) {
      if (null !== walletToken.walletAddress) {
        addresses.push(walletToken.walletAddress);
      } else if (true === walletToken.isDeploying) {
        await _.checkTokenAddress(network.server, walletToken, wallet.keys.public);
      }
    }
    const accountsData = await TonApi.requestAccountsData(network.server, addresses);
    let walletBalance = "0";
    let walletCodeHash = null;
    for (const accountData of accountsData) {
      if (accountData.id === wallet.address) {
        walletBalance = accountData.balance;
        walletCodeHash = accountData.code_hash;
      } else {
        const token = _.getTokenByAddress(walletTokens, accountData.id);
        const contract = tokenContractLib.getContractById(token.contractId);
        token.balance = await contract.getBalanceByBoc(network.server, accountData.id, accountData.boc);
        await tokenRepository.updateBalance(token);
      }
    }
    await walletRepository.updateNetworkData(wallet, networkId, walletBalance, walletCodeHash);

    const tokens = await tokenRepository.getAll();

    return {walletId: wallet.id, networkId, data: wallet.networks[networkId], tokens};
  }
}
