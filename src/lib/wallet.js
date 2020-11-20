import database from '@/db';
import TonApi from '@/api/ton';
import walletContractLib from '@/lib/walletContract';

const _ = {
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}

export default {
  async isLoggedIn() {
    const db = await database.getClient();
    return (await db.param.get('address')).value !== null;
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
    const db = await database.getClient();
    return (await db.network.get(networkId)).account.codeHash !== null;
  },
  async deploy(networkId) {
    const db = await database.getClient();
    const server = (await db.network.get(networkId)).server;
    const keys = (await db.param.get('keys')).value;
    const contractId = (await db.param.get('contractId')).value;
    const walletContract = walletContractLib.getContractById(contractId);
    const constructorParams = {owners: [`0x${keys.public}`], reqConfirms: 1};
    const message = await TonApi.createDeployMessage(server, keys, walletContract, {}, constructorParams);
    const processingState = await TonApi.sendMessage(server, message);
    return await TonApi.waitForDeployTransaction(server, message, processingState);
  },
  async deployContract(networkId, abi, imageBase64, initParams, constructorParams) {
    const db = await database.getClient();
    const server = (await db.network.get(networkId)).server;
    const keys = (await db.param.get('keys')).value;
    const contract = {abi, imageBase64};
    const message = await TonApi.createDeployMessage(server, keys, contract, initParams, constructorParams);
    const processingState = await TonApi.sendMessage(server, message);
    return {processingState, message};
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
  async transfer(networkId, destinationAddress, nanoAmount, bounce = false, payload = '') {
    const db = await database.getClient();
    const server = (await db.network.get(networkId)).server;
    const walletAddress = (await db.param.get('address')).value;
    const keys = (await db.param.get('keys')).value;
    const contractId = (await db.param.get('contractId')).value;
    const walletContract = walletContractLib.getContractById(contractId);
    const abi = walletContract.abi;
    const input = {dest: destinationAddress, value: nanoAmount, bounce, allBalance: false, payload};
    const result = await TonApi.run(server, walletAddress, 'submitTransaction', abi, input, keys);
    return result.transaction.id;
  },
  addressToView(address) {
    return `${address.substr(0, 8)}...${address.substr(-6)}`;
  },
  compileExplorerLink(explorer, address) {
    return `https://${explorer}/accounts?section=details&id=${address}`;
  }
};
