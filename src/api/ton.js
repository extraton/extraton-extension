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
  // async createRunMessage(server, address, abi, functionName, input, keyPair) {
  //   const client = await ton.getClient(server);
  //   return await client.contracts.createRunMessage({address, abi, functionName, input, keyPair});
  // },
  // async sendMessage(server, runMessage) {
  //   const client = await ton.getClient(server);
  //   return await client.contracts.sendMessage(runMessage.message);
  // },
  // async waitForRunTransaction(server, runMessage, messageProcessingState) {
  //   const client = await ton.getClient(server);
  //   try {
  //     const result = await client.contracts.waitForRunTransaction(runMessage, messageProcessingState);
  //     console.log(`Tokens were sent. Transaction id is ${result.transaction.id}`);
      // console.log(`Run fees are  ${JSON.stringify(result.fees, null, 2)}`);
    // } catch (err){
      // console.log(err);
    // }
  // },
  // async runGet(server, address, functionName, input) {
  //   const client = await ton.getClient(server);
  //   const result = await client.contracts.runGet({address, functionName, input});
  //   console.log(result);
  // },
  async run(server, address, functionName, abi, input, keyPair = null) {
    const client = await ton.getClient(server);
    await client.contracts.run({address, functionName, abi, input, keyPair});
  }
}
