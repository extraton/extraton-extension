import {TonClient} from "@tonclient/core";
import {tonException} from '@/api/exception/tonException';
import {Base64} from 'js-base64';

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
  },
};

const ton = {
  client: null,
  seedPhraseDictionaryEnglish: 1,
  hdPath: "m/44'/396'/0'/0/0",
  async getClient(server) {
    if (null === this.client || server !== this.client.config.network.server_address) {
      this.client = new TonClient({
        network: {
          server_address: server,
        }
      });
    }
    return this.client;
  },
  base64ToHex(str) {
    const bin = atob(str.replace(/[ \r\n]+$/, ""));
    let hex = [];
    for (let i = 0; i < bin.length; ++i) {
      let tmp = bin.charCodeAt(i).toString(16);
      if (tmp.length === 1) tmp = "0" + tmp;
      hex[hex.length] = tmp;
    }
    return hex.join('');
  }
};

export default {
  async generateSeed(server) {
    try {
      const client = await ton.getClient(server);
      return (await client.crypto.mnemonic_from_random({
        dictionary: ton.seedPhraseDictionaryEnglish,
        word_count: 12,
      })).phrase;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async convertSeedToKeys(server, seed) {
    try {
      const client = await ton.getClient(server);
      const worldCount = seed.match(/[^\s-.]+/g).length === 12 ? 12 : 24;
      return await client.crypto.mnemonic_derive_sign_keys({
        dictionary: ton.seedPhraseDictionaryEnglish,
        word_count: worldCount,
        phrase: seed,
        path: ton.hdPath
      });
    } catch (e) {
      throw _.getException(e);
    }
  },
  compileContractAbi: (value) => {
    return {type: "Contract", value};
  },
  async sha256(server, data) {
    const client = await ton.getClient(server);
    return (await client.crypto.sha256({data: Base64.encode(data)})).hash;
  },
  async chacha20Encrypt(server, data, password) {
    try {
      const client = await ton.getClient(server);
      const key = await this.sha256(server, password);

      const randomBytesBase64 = (await client.crypto.generate_random_bytes({length: 12})).bytes;
      const nonce = ton.base64ToHex(randomBytesBase64);

      const dataBase64 = Base64.encode(data);
      const resultOfChaCha20 = await client.crypto.chacha20({data: dataBase64, key, nonce});

      return {data: resultOfChaCha20.data, nonce};
    } catch (e) {
      throw _.getException(e);
    }
  },
  async chacha20Decrypt(server, data, nonce, password) {
    try {
      const client = await ton.getClient(server);
      const key = await this.sha256(server, password);
      const decryptedData = (await client.crypto.chacha20({data, key, nonce})).data;
      return Base64.decode(decryptedData);
    } catch (e) {
      throw _.getException(e);
    }
  },
  async requestAccountData(server, address) {
    try {
      const client = await ton.getClient(server);
      return (await client.net.query_collection({
        collection: 'accounts',
        filter: {id: {eq: address}},
        result: 'id, balance(format: DEC), code_hash, boc',
      })).result[0] || null;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async requestAccountTransactions(server, address) {
    try {
      const client = await ton.getClient(server);
      return (await client.net.query_collection({
        collection: 'transactions',
        filter: {account_addr: {eq: address}},
        order: [{path: "now", direction: "DESC"}],
        result: 'id, now, balance_delta(format:DEC)',
        limit: 15,
      })).result;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async encodeMessage(server, address, abi, function_name, input = {}, keys = null) {
    try {
      const client = await ton.getClient(server);
      const signer = null !== keys ? {type: 'Keys', keys} : {type: 'None'};
      const call_set = {function_name, input};
      return await client.abi.encode_message({abi, address, call_set, signer});
    } catch (e) {
      throw _.getException(e);
    }
  },
  async encodeDeployMessage(server, abi, tvc, initial_data, input, keys) {
    try {
      const client = await ton.getClient(server);
      const signer = {type: 'Keys', keys};
      const deploy_set = {tvc, initial_data};
      const call_set = {function_name: 'constructor', input};
      return await client.abi.encode_message({abi, deploy_set, call_set, signer});
    } catch (e) {
      throw _.getException(e);
    }
  },
  async encodeMessageBody(server, abi, function_name, input = {}, keys = null) {
    const client = await ton.getClient(server);
    const signer = null !== keys ? {type: 'Keys', keys} : {type: 'None'};
    const call_set = {function_name, input};
    return (await client.abi.encode_message_body({abi, call_set, signer, is_internal: true})).body;
  },
  async runTvm(server, abi, boc, message) {
    try {
      const client = await ton.getClient(server);
      // @TODO by doc if pass abi then run_tvm should decode message, but it doesn't occur.
      const resultOfRunTvm = await client.tvm.run_tvm({message, account: boc});
      const result = await client.abi.decode_message({abi, message: resultOfRunTvm.out_messages[0]});
      return result.value;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async sendMessage(server, message, abi) {
    try {
      const client = await ton.getClient(server);
      const ResultOfSendMessage = await client.processing.send_message({message, abi, send_events: false});
      return ResultOfSendMessage.shard_block_id;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async waitForTransaction(server, message, abi, shard_block_id) {
    try {
      const contractAbi = this.compileContractAbi(abi);
      const client = await ton.getClient(server);
      const result = await client.processing.wait_for_transaction({
        message,
        abi: contractAbi,
        shard_block_id,
        send_events: false
      });
      return {id: result.transaction.id};
    } catch (e) {
      throw _.getException(e);
    }
  },
  async predictAddress(server, abi, tvc, public_key, workchain_id = 0, initial_data = {}) {
    try {
      const client = await ton.getClient(server);
      const deploy_set = {tvc, initial_data, workchain_id};
      const signer = {type: 'External', public_key};

      return (await client.abi.encode_message({abi, deploy_set, signer})).address;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async convertAddress(server, address,) {
    try {
      const client = await ton.getClient(server);
      return (await client.utils.convert_address({address, output_format: {type: 'Hex'}})).address;
    } catch (e) {
      throw _.getException(e);
    }
  },
  async runExecutor(server, message, account, abi) {
    try {
      const client = await ton.getClient(server);

      return await client.tvm.run_executor({message, account, abi});
    } catch (e) {
      throw _.getException(e);
    }
  },
}



