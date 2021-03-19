import hex2ascii from 'hex2ascii';
import tonLib from "@/api/tonSdk";
import rootAbi from "@/lib/token/tip3/radiance/RootTokenContract.abi.json";
import tokenWalletAbi from "@/lib/token/tip3/radiance/TONTokenWallet.abi.json";
import dexClientAbi from "@/lib/token/tip3/radiance/DEXclient.abi.json";
import dexClientTvc from "@/lib/token/tip3/radiance/DEXclient.tvc.base64";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import createNewEmptyTokenWallet from "@/lib/task/interactive/callback/createNewEmptyTokenWallet";
import radianceDeployDexClient from "@/lib/task/interactive/callback/radianceDeployDexClient";

const _ = {
  getName: async (server, boc, rootAddress) => {
    const message = await tonLib.encodeMessage(server, rootAddress, rootAbi, 'getName');
    const data = await tonLib.runTvm(server, rootAbi, boc, message.message);

    return hex2ascii(data.value0);
  },
  getSymbol: async (server, boc, rootAddress) => {
    const message = await tonLib.encodeMessage(server, rootAddress, rootAbi, 'getSymbol');
    const data = await tonLib.runTvm(server, rootAbi, boc, message.message);

    return hex2ascii(data.value0);
  },
  getDecimals: async (server, boc, rootAddress) => {
    const message = await tonLib.encodeMessage(server, rootAddress, rootAbi, 'getDecimals');
    const data = await tonLib.runTvm(server, rootAbi, boc, message.message);
    return data.value0;
  },
  async fetchWalletAddress(server, dexClientAddress, rootAddress) {
    const dexClient = await tonLib.requestAccountData(server, dexClientAddress);
    if (null === dexClient) {
      return null;
    }
    const message = await tonLib.encodeMessage(
      server,
      dexClientAddress,
      dexClientAbi,
      'getWalletByRoot',
      {rootAddr: rootAddress},
    );
    const response = (await tonLib.runTvm(server, dexClientAbi, dexClient.boc, message.message)).wallet;
    if (response === '0:0000000000000000000000000000000000000000000000000000000000000000') {
      return null;
    }

    return response;
  },
  async getBalance(server, walletAddress) {
    const account = await tonLib.requestAccountData(server, walletAddress);
    return await this.getBalanceByBoc(server, walletAddress, account.boc);
  },
  async getBalanceByBoc(server, walletAddress, boc) {
    const message = await tonLib.encodeMessage(
      server,
      walletAddress,
      tokenWalletAbi,
      'getBalance',
    );
    return (await tonLib.runTvm(server, tokenWalletAbi, boc, message.message)).value0;
  }
};


export default {
  id: 1,
  codeHash: '8d75a1d708598b6dc99afb34ef676ff6db9dca5a59ec01a101850d661c8e8729',//root
  async getTokenData(server, boc, rootAddress, publicKey) {
    const dexClientAddress = await tonLib.predictAddress(server, dexClientAbi, dexClientTvc, publicKey);

    const name = await _.getName(server, boc, rootAddress);
    const symbol = await _.getSymbol(server, boc, rootAddress);
    const decimals = await _.getDecimals(server, boc, rootAddress);
    const walletAddress = await _.fetchWalletAddress(server, dexClientAddress, rootAddress);
    const balance = null !== walletAddress ? await _.getBalance(server, walletAddress) : 0;

    return {name, symbol, decimals, walletAddress, balance, params: {dexClientAddress}};
  },
  // async getWalletAddress(server, contract, boc, address) {
  //   const message = await tonLib.encodeMessage(
  //     server,
  //     address,
  //     dexClientAbi,
  //     'getWalletByRoot',
  //     {rootAddr: token.rootAddress},
  //   );
  //   token.walletAddress = (await tonLib.runTvm(server, dexClientAbi, dexClient.boc, message.message)).wallet;
  // },
  async initTokenActivation(network, token, interactiveTaskRequestId, wallet) {
    const dexClientAddress = await tonLib.predictAddress(network.server, dexClientAbi, dexClientTvc, wallet.keys.public);
    const dexClient = await tonLib.requestAccountData(network.server, dexClientAddress);
    if (null === dexClient) {
      await interactiveTaskRepository.createTask(
        interactiveTaskType.preDeployTransfer,
        network.id,
        interactiveTaskRequestId,
        {
          options: {initAmount: '5000000000', initParams: {}},
          abi: dexClientAbi.value,
          imageBase64: dexClientTvc,
          constructorParams: {},
        },
      );
      const callback = {
        name: radianceDeployDexClient.name,
        params: [token.id, network.id, interactiveTaskRequestId, dexClientAddress]
      };
      await interactiveTaskRepository.createTask(
        interactiveTaskType.deployContract,
        network.id,
        interactiveTaskRequestId,
        {
          options: {initAmount: '5000000000', initParams: {}},
          abi: dexClientAbi.value,
          imageBase64: dexClientTvc,
          constructorParams: {},
          async: false,
        },
        {callback}
      );
    } else {
      await this.addCreateNewEmptyWalletTask(token, network, interactiveTaskRequestId, dexClientAddress);
    }
  },
  async addCreateNewEmptyWalletTask(token, network, interactiveTaskRequestId, dexClientAddress) {
    //@TODO fees
    const fees = '0.017518294'
    const callback = {name: createNewEmptyTokenWallet.name, params: [network.server, token.id,]};
    await interactiveTaskRepository.createTask(
      interactiveTaskType.runTransaction,
      network.id,
      interactiveTaskRequestId,
      {
        address: dexClientAddress,
        abi: dexClientAbi.value,
        method: 'createNewEmptyWalletByOwner',
        params: {rootAddr: token.rootAddress},
        async: false,
      },
      {fees, callback},
    );
  },
  async transfer(server, keys, token, destAddress, amount) {
    const message = await tonLib.encodeMessage(
      server,
      token.params.dexClientAddress,
      dexClientAbi,
      'sendTokens3',
      {from: token.walletAddress, to: destAddress, tokens: amount},
      keys
    );
    const shardBlockId = await tonLib.sendMessage(server, message.message, dexClientAbi);
    await tonLib.waitForTransaction(server, message.message, dexClientAbi, shardBlockId);
  },
  async getBalanceByBoc(server, walletAddress, boc) {
    return await _.getBalanceByBoc(server, walletAddress, boc);
  },
  async fetchWalletAddress(server, token) {
    return await _.fetchWalletAddress(server, token.params.dexClientAddress, token.rootAddress);
  }
}
