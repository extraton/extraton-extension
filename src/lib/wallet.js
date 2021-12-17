import TonApi from '@/api/ton';
import tonLib from '@/api/tonSdk';
import walletContractLib from '@/lib/walletContract';
import {walletRepository} from "@/db/repository/walletRepository";
import utils from "@/lib/utils";
import BN from "bignumber.js";
import {extensionEvent, extensionEventType} from "@/lib/extensionEvent";
import {paramRepository} from "@/db/repository/paramRepository";
const TransferAbi = require('@/contracts/Transfer.abi.json');

const _ = {
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}

export default {
  async isLoggedIn() {
    const wallets = await walletRepository.getAllWithoutKeys();
    return Object.keys(wallets).length > 0;
  },
  //@TODO infinity
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
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const constructorParams = {owners: [`0x${wallet.keys.public}`], reqConfirms: 1};
    const message = await tonLib.encodeDeployMessage(server, abi, walletContract.imageBase64, {}, constructorParams, wallet.keys);
    const shardBlockId = await tonLib.sendMessage(server, message.message, abi);
    return tonLib.waitForTransaction(server, message.message, abi, shardBlockId);
  },
  async deployContract(server, wallet, abi, tvc, initial_data, input, initial_pubkey) {
    const message = await tonLib.encodeDeployMessage(server, abi, tvc, initial_data, input, wallet.keys, initial_pubkey);
    const shardBlockId = await tonLib.sendMessage(server, message.message, abi);
    return {shardBlockId, message};
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
    const message = await tonLib.encodeMessage(server, walletAddress, abi, 'submitTransaction', input, wallet.keys);
    return message.message;
  },
  async createLegacyTransferMessage(server, wallet, walletAddress, destinationAddress, nanoAmount, bounce = false, payload = '') {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const abi = walletContract.abi;
    const input = {dest: destinationAddress, value: nanoAmount, bounce, allBalance: false, payload};
    return await TonApi.createRunMessage(server, walletAddress, abi, 'submitTransaction', input, wallet.keys);
  },
  async transfer(server, wallet, destinationAddress, nanoAmount, bounce = false, payload = '') {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const input = {dest: destinationAddress, value: nanoAmount, bounce, allBalance: false, payload};
    const message = await tonLib.encodeMessage(server, wallet.address, abi, 'submitTransaction', input, wallet.keys);
    return tonLib.sendMessage(server, message.message, abi);
  },
  async createLegacyConfirmTransactionMessage(server, wallet, walletAddress, transactionId) {
    const walletContract = walletContractLib.getContractById(walletContractLib.ids.safeMultisig);
    const abi = walletContract.abi;
    const input = {transactionId};
    return await TonApi.createRunMessage(server, walletAddress, abi, 'confirmTransaction', input, wallet.keys);
  },
  async createConfirmTransactionMessage(server, wallet, walletAddress, transactionId) {
    const walletContract = walletContractLib.getContractById(walletContractLib.ids.safeMultisig);
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const input = {transactionId};
    return (await tonLib.encodeMessage(server, walletAddress, abi, 'confirmTransaction', input, wallet.keys)).message;
  },
  async createTransferPayload(server, text) {
    const comment = utils.hexEncode(text);
    const abi = tonLib.compileContractAbi(TransferAbi);
    return (await tonLib.encodeMessageBody(server, abi, 'transfer', {comment})).body;
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
    const walletContract = walletContractLib.getContractById(contractId);
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const address = await tonLib.predictAddress(server, abi, walletContract.imageBase64, keys.public);

    const wallet = await walletRepository.create(contractId, address, keys, isRestoring);
    wallet.name = wallet.id === 1 ? 'Main Wallet' : `Wallet ${wallet.id}`;
    await walletRepository.updateName(wallet);
    await this.changeWallet(wallet.id);
  },
  async changeWallet(walletId) {
    const currentWalletId = await paramRepository.find('wallet');
    if (walletId !== currentWalletId) {
      await paramRepository.createOrUpdate('wallet', walletId);
      extensionEvent.emit(extensionEventType.changeWallet).then();
    }
  }
};
