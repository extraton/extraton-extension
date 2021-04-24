import tonLib from "@/api/tonSdk";
import walletContractLib from '@/lib/walletContract';
import {walletRepository} from "@/db/repository/walletRepository";
import utils from "@/lib/utils";
import database from "@/db";
import BN from "bignumber.js";
const TransferAbi = require('@/contracts/Transfer.abi.json');


const _ = {
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}

export default {
  async isLoggedIn() {
    const wallets = await walletRepository.getAllWithoutKeys();
    return Object.keys(wallets).length > 0;
  },
  async waitLoggedIn() {
    if (await this.isLoggedIn()) {
      return;
    }
    await _.timeout(500);
    return await this.waitLoggedIn();
  },
  async isContractDeployed(networkId) {
    const wallet = await walletRepository.getCurrent();
    return wallet.networks[networkId].codeHash !== null;
  },
  async deploy(server, wallet) {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const constructorParams = {owners: [`0x${wallet.keys.public}`], reqConfirms: 1};
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const message = await tonLib.encodeDeployMessage(server, abi, walletContract.imageBase64, {}, constructorParams, wallet.keys);
    const shardBlockId = await tonLib.sendMessage(server, message.message, abi);
    return await tonLib.waitForTransaction(server, message.message, abi, shardBlockId);
  },
  convertToNano(value) {
    const splitted = value.split('.');
    const intPart = BigInt(splitted[0]) * BigInt('1000000000');
    const decPart = BigInt(splitted.length > 1 ? `${splitted[1]}${'0'.repeat(9 - splitted[1].length)}` : '0');
    return intPart + decPart;
  },
  convertFromNano(amountNano, decimalNum) {
    const minDecimalNum = 3;
    const amountBigInt = BigInt(amountNano);
    const integer = amountBigInt / BigInt('1000000000');
    const reminderStr = (amountBigInt % BigInt('1000000000')).toString();
    const decimalPrependZerosNum = 9 - reminderStr.length;
    const reminderRtrimedZeros = reminderStr.replace(/0+$/g, '');
    const decimalStr = `${'0'.repeat(decimalPrependZerosNum)}${reminderRtrimedZeros}`;
    const decimalCut = decimalStr.substr(0, decimalNum);
    const decimalResult = minDecimalNum - decimalCut.length > 0
      ? `${decimalCut}${'0'.repeat(minDecimalNum - decimalCut.length)}`
      : decimalCut;
    const integerFormatted = integer.toLocaleString();
    return `${integerFormatted}.${decimalResult}`;
  },
  convertToView(amount, decimals, decimalPoints = 3) {
    const decimalPointsBn = BN(decimalPoints);
    const decimalsBn =  BN(decimals);
    const divisionBy = BN('10').exponentiatedBy(decimalsBn);
    const decimalPointsInFine = (decimalPointsBn.isGreaterThan(decimalsBn) ? decimalsBn : decimalPointsBn).toNumber();
    return BN(amount).dividedBy(divisionBy).toFormat(decimalPointsInFine, BN.ROUND_DOWN);
  },
  async createTransferMessage(server, wallet, walletAddress, destinationAddress, nanoAmount, bounce = false, payload = '') {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const input = {dest: destinationAddress, value: nanoAmount, bounce, allBalance: false, payload};
    return await tonLib.encodeMessage(server, walletAddress, abi, 'submitTransaction', input, wallet.keys);
  },
  // async transfer(server, wallet, destinationAddress, nanoAmount, bounce = false, payload = '') {
  //   const walletContract = walletContractLib.getContractById(wallet.contractId);
  //   const abi = walletContract.abi;
  //   const input = {dest: destinationAddress, value: nanoAmount, bounce, allBalance: false, payload};
  //   const result = await TonApi.run(server, wallet.address, 'submitTransaction', abi, input, wallet.keys);
  //   return result.transaction.id;
  // },
  async createTransferPayload(server, text) {
    const comment = utils.hexEncode(text);
    const abi = tonLib.compileContractAbi(TransferAbi);
    return await tonLib.encodeMessageBody(server, abi, 'transfer', {comment});
  },
  async getWalletAddress() {
    const wallet = await walletRepository.getCurrent();
    return wallet.address;
  },
  addressToView(address) {
    return `${address.substr(0, 8)}...${address.substr(-6)}`;
  },
  isAddressesMatch(address1, address2) {
    return address1.toLowerCase() === address2.toLowerCase();
  },
  isKeysEncrypted(keys) {
    return typeof keys.secret === 'undefined';
  },
  compileExplorerLink(explorer, address) {
    return `https://${explorer}/accounts/accountDetails?id=${address}`;
  },
  async restore(server, contractId, keys, isRestoring) {
    const db = await database.getClient();
    const contract = walletContractLib.getContractById(contractId);
    const abi = tonLib.compileContractAbi(contract.abi);
    const address = await tonLib.predictAddress(server, abi, contract.imageBase64, keys.public);

    const wallet = await walletRepository.create(contractId, address, keys, isRestoring);
    wallet.name = wallet.id === 1 ? 'Main Wallet' : `Wallet ${wallet.id}`;
    await walletRepository.updateName(wallet);

    await db.param.update('wallet', {value: wallet.id});
  },
};
