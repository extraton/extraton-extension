import database from '@/db';
import TonApi from '@/api/ton';

const setcodeMultisig = require('@/contracts/SetcodeMultisigWallet.json');

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
    const message = await TonApi.createDeployMessage(server, keys);
    const processingState = await TonApi.sendMessage(server, message);
    return await TonApi.waitForDeployTransaction(server, message, processingState);
  },
  convertToNano(value) {
    const splitted = value.split('.');
    const intPart = BigInt(splitted[0]) * BigInt('1000000000');
    const decPart = BigInt(splitted.length > 1 ? `${splitted[1]}${'0'.repeat(9 - splitted[1].length)}` : '0');
    return intPart + decPart;
  },
  async transfer(networkId, destinationAddress, amount) {
    const db = await database.getClient();
    const server = (await db.network.get(networkId)).server;
    const walletAddress = (await db.param.get('address')).value;
    const keys = (await db.param.get('keys')).value;
    const abi = setcodeMultisig.abi;
    const nanoAmount = this.convertToNano(amount).toString();
    console.log({nanoAmount, amount});
    const input = {dest: destinationAddress, value: nanoAmount, bounce: false, allBalance: false, payload: ''};
    const result = await TonApi.run(server, walletAddress, 'submitTransaction', abi, input, keys);
    return result.transaction.id;
  }
};