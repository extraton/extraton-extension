import {TONClient} from 'ton-client-web-js';
import {tonException} from '@/api/exception/tonException';

const _ = {
  getException: (e) => {
    let code, message;
    if (typeof e.code !== 'undefined' && typeof e.message !== 'undefined') {
      code = e.code;
      message = e.message;
    } else {
      console.error(e);
      code = null;
      message = 'Unknown TON error';
    }
    return new tonException(code, message);
  }
};

const ton = {
  client: null,
  seedPhraseWorldCount: 12,
  seedPhraseDictionaryEnglish: 1,
  hdPath: "m/44'/396'/0'/0/0",
  async getClient(server) {
    if (null === this.client || server !== this.client.config.data.servers[0]) {
      // console.log(`Getting TON client for '${server}'`);
      this.client = await TONClient.create({
        servers: [server] //@TODO multiple servers??
      });
    }
    return this.client;
  },
};

export default {
  async generateSeed(server) {
    try {
      const client = await ton.getClient(server);
      return await client.crypto.mnemonicFromRandom(
        {dictionary: ton.seedPhraseDictionaryEnglish, wordCount: ton.seedPhraseWorldCount}
      );
    } catch (e) {
      throw _.getException(e);
    }
  },
  async convertSeedToKeys(server, seed) {
    try {
      const client = await ton.getClient(server);
      return await client.crypto.mnemonicDeriveSignKeys({
        dictionary: ton.seedPhraseDictionaryEnglish,
        wordCount: ton.seedPhraseWorldCount,
        phrase: seed,
        path: ton.hdPath
      });
    } catch (e) {
      throw _.getException(e);
    }
  },
  async predictAddress(server, pub, abi, imageBase64, initParams = {}) {
    try {
      const client = await ton.getClient(server);
      return (await client.contracts.getDeployData({
        abi,
        imageBase64,
        initParams,
        publicKeyHex: pub,
        workchainId: 0,
      })).address;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async createRunBody(server, abi, functionName, params) {
    try {
      const client = await ton.getClient(server);
      return (await client.contracts.createRunBody({
        abi,
        function: functionName,
        params,
        internal: true
      })).bodyBase64;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async requestAccountData(server, address) {
    try {
      const client = await ton.getClient(server);
      const data = await client.queries.accounts.query({id: {eq: address}}, 'balance(format: DEC), code_hash');
      return data.length > 0 ? data[0] : null;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async createRunMessage(server, address, abi, functionName, input, keyPair) {
    try {
      const client = await ton.getClient(server);
      return await client.contracts.createRunMessage({address, abi, functionName, input, keyPair});
    } catch (e) {
      throw _.getException(e);
    }
  },
  async waitForRunTransaction(server, message, messageProcessingState) {
    try {
      const client = await ton.getClient(server);
      const result = await client.contracts.waitForRunTransaction(message, messageProcessingState);
      return result.transaction.id;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async runGet(server, address, functionName) {
    try {
      const client = await ton.getClient(server);
      return await client.contracts.runGet({address, functionName});
    } catch (e) {
      throw _.getException(e);
    }
  },
  async calcRunFees(server, address, functionName, abi, input, keyPair) {
    try {
      const client = await ton.getClient(server);
      return await client.contracts.calcRunFees({
        address,
        functionName,
        abi,
        input,
        keyPair
      });
    } catch (e) {
      throw _.getException(e);
    }
  },
  async calcDeployFees(server, keyPair, contract, initParams, constructorParams) {
    try {
      const client = await ton.getClient(server);
      return await client.contracts.calcDeployFees({
        package: contract,
        constructorParams,
        initParams,
        keyPair,
        emulateBalance: true, //@TODO
        newaccount: true, //@TODO
      });
    } catch (e) {
      throw _.getException(e);
    }
  },
  async createDeployMessage(server, keyPair, contract, initParams, constructorParams) {
    try {
      const client = await ton.getClient(server);
      const data = {
        package: contract,
        constructorParams,
        initParams,
        keyPair,
      };
      // console.log(data);
      return await client.contracts.createDeployMessage(data);
    } catch (e) {
      throw _.getException(e);
    }
  },
  async sendMessage(server, message) {
    try {
      const client = await ton.getClient(server);
      return await client.contracts.sendMessage(message.message);
    } catch (e) {
      throw _.getException(e);
    }
  },
  async waitForDeployTransaction(server, message, processingState) {
    try {
      const client = await ton.getClient(server);
      const result = await client.contracts.waitForDeployTransaction(message, processingState);
      return result.transaction.id;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async run(server, address, functionName, abi, input = {}, keyPair = null) {
    try {
      const client = await ton.getClient(server);
      return await client.contracts.run({address, functionName, abi, input, keyPair});
    } catch (e) {
      throw _.getException(e);
    }
  },
}
