import {TONClient} from 'ton-client-web-js';

const setcodeMultisig = require('@/contracts/SetcodeMultisigWallet.json');

const ton = {
  client: null,
  seedPhraseWorldCount: 12,
  seedPhraseDictionaryEnglish: 1,
  hdPath: "m/44'/396'/0'/0/0",
  async getClient(server) {
    if (null === this.client || server !== this.client.config.data.servers[0]) {
      console.log(`Getting TON client for '${server}'`);
      this.client = await TONClient.create({
        servers: [server] //@TODO multiple servers??
      });
    }
    return this.client;
  },
};

export default {
  async generateSeed(server) {
    const client = await ton.getClient(server);
    return await client.crypto.mnemonicFromRandom(
      {dictionary: ton.seedPhraseDictionaryEnglish, wordCount: ton.seedPhraseWorldCount}
    );
  },
  async convertSeedToKeys(server, seed) {
    const client = await ton.getClient(server);
    return await client.crypto.mnemonicDeriveSignKeys({
      dictionary: ton.seedPhraseDictionaryEnglish,
      wordCount: ton.seedPhraseWorldCount,
      phrase: seed,
      path: ton.hdPath
    });
  },
  async predictAddress(server, pub) {
    const client = await ton.getClient(server);
    return (await client.contracts.getDeployData({
      abi: setcodeMultisig.abi,
      imageBase64: setcodeMultisig.imageBase64,
      publicKeyHex: pub,
      workchainId: 0,
    })).address;
  },
  async requestAccountData(server, address) {
    const client = await ton.getClient(server);
    const data = await client.queries.accounts.query({id: {eq: address}}, 'balance(format: DEC), code_hash');
    return data.length > 0 ? data[0] : null;
  },
  // async createRunMessage(server, address, abi, functionName, input, keys) {
  //   const client = await ton.getClient(server);
  //   return await client.contracts.createRunMessage({address, abi, functionName, input, keys});
  // },
  // async waitForRunTransaction(server, message, messageProcessingState) {
  //   const client = await ton.getClient(server);
  //   const result = await client.contracts.waitForRunTransaction(message, messageProcessingState);
  //   return result.transaction.id;
  // },
  async runGet(server, address, functionName) {
    const client = await ton.getClient(server);
    return await client.contracts.runGet({address, functionName});
  },
  async createDeployMessage(server, keyPair) {
    const client = await ton.getClient(server);
    return await client.contracts.createDeployMessage({
      package: setcodeMultisig,
      constructorParams: {owners: [`0x${keyPair.public}`], reqConfirms: 1},
      keyPair,
    })
  },
  async sendMessage(server, message) {
    const client = await ton.getClient(server);
    return await client.contracts.sendMessage(message.message);
  },
  async waitForDeployTransaction(server, message, processingState) {
    const client = await ton.getClient(server);
    const result = await client.contracts.waitForDeployTransaction(message, processingState);
    return result.transaction.id;
  },
  async run(server, address, functionName, abi, input = {}, keyPair = null) {
    const client = await ton.getClient(server);
    return await client.contracts.run({address, functionName, abi, input, keyPair});
  }
}
