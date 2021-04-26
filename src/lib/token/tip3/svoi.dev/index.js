import hex2ascii from 'hex2ascii';
import tonLib from "@/api/tonSdk";
import rootAbi from "@/lib/token/tip3/svoi.dev/RootTokenContract.abi.json";
import tokenWalletAbi from "@/lib/token/tip3/svoi.dev/TONTokenWallet.abi.json";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import tonSdk from "@/api/tonSdk";
import createNewEmptyTokenWalletCallback from "@/lib/task/interactive/callback/createNewEmptyTokenWallet";

const _ = {
  getDetails: async (server, boc, rootAddress) => {
    const message = await tonLib.encodeMessage(server, rootAddress, rootAbi, 'getDetails');
    const data = await tonLib.runTvm(server, rootAbi, boc, message.message);

    return data.value0;
  },
  async fetchWalletAddress(server, rootAddress, publicKey) {
    const rootContractData = await tonLib.requestAccountData(server, rootAddress);
    const message = await tonLib.encodeMessage(
      server,
      rootAddress,
      rootAbi,
      'getWalletAddress',
      {
        wallet_public_key_: `0x${publicKey}`,
        owner_address_: '0:0000000000000000000000000000000000000000000000000000000000000000'
      },
    );
    const address = (await tonLib.runTvm(server, rootAbi, rootContractData.boc, message.message)).value0;
    const tokenWalletData = await tonLib.requestAccountData(server, address);
    if (null === tokenWalletData) {
      return null;
      //@TODO check deployed
    } else {
      return address;
    }
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
      'balance',
    );
    return (await tonLib.runTvm(server, tokenWalletAbi, boc, message.message)).balance;
  }
};


export default {
  id: 2,
  rootCodeHash: '2ff4aaaab0f31d5a7b276b78a490277aa043d445bb71ac7c3dac8ae9e39b4d23',
  walletCodeHash: '2f062cde9cc0e2999f6bded5b4f160578b81530aaa3ae7d7077df60cd40f6056',
  async getTokenData(server, boc, rootAddress, publicKey) {
    const details = await _.getDetails(server, boc, rootAddress);
    const name = hex2ascii(details.name);
    const symbol = hex2ascii(details.symbol);
    const decimals = details.decimals;
    const startGasBalance = details.start_gas_balance;
    const walletAddress = await _.fetchWalletAddress(server, rootAddress, publicKey);
    const balance = null !== walletAddress ? await _.getBalance(server, walletAddress) : 0;

    return {name, symbol, decimals, walletAddress, balance, params: {startGasBalance}};
  },
  async initTokenActivation(network, token, interactiveTaskRequestId, wallet) {
    //@TODO fees
    const fees = '0.011'
    const callback = {name: createNewEmptyTokenWalletCallback.name, params: [network.server, token.id]};
    const input = {
      grams: token.params.startGasBalance,
      // grams: '100000000',
      wallet_public_key_: `0x${wallet.keys.public}`,
      owner_address_: "0:0000000000000000000000000000000000000000000000000000000000000000",
      gas_back_address: "0:0000000000000000000000000000000000000000000000000000000000000000",
    };
    const payload = (await tonSdk.encodeMessageBody(network.server, rootAbi, 'deployEmptyWallet', input)).body;
    return await interactiveTaskRepository.createTask(
      interactiveTaskType.transfer,
      network.id,
      interactiveTaskRequestId,
      {
        walletAddress: wallet.address,
        address: token.rootAddress,
        amount: (BigInt(token.params.startGasBalance) + BigInt('500000000')).toString(),
        bounce: true,
        payload,
        async: false,
      },
      {fees, callback, isItLoggedWalletAddress: true},
    );
  },
  async transfer(server, keys, token, destAddress, amount) {
    //@TODO target_gas_balance
    const message = await tonLib.encodeMessage(
      server,
      token.walletAddress,
      tokenWalletAbi,
      'transfer',
      {to: destAddress, tokens: amount, grams: '150000000'},
      keys
    );
    const shardBlockId = await tonLib.sendMessage(server, message.message, tokenWalletAbi);
    return {shardBlockId, message: message.message, abi: tokenWalletAbi.value};
  },
  async getBalanceByBoc(server, walletAddress, boc) {
    return await _.getBalanceByBoc(server, walletAddress, boc);
  },
  async fetchWalletAddress(server, token, publicKey) {
    return await _.fetchWalletAddress(server, token.rootAddress, publicKey);
  },
  compileApiDataView() {
    return {};
  },
  getCallRestrictions() {
    return [];
  },
}
