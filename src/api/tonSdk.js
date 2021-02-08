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
  }
};

const ton = {
  client: null,
  seedPhraseWorldCount: 12,
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
  async convertSeedToKeys(server, seed) {
    try {
      const client = await ton.getClient(server);
      return await client.crypto.mnemonic_derive_sign_keys({
        dictionary: ton.seedPhraseDictionaryEnglish,
        word_count: ton.seedPhraseWorldCount,
        phrase: seed,
        path: ton.hdPath
      });
    } catch (e) {
      throw _.getException(e);
    }
  },
  async chacha20Encrypt(server, data, password) {
    try {
      const client = await ton.getClient(server);
      const key = (await client.crypto.sha256({data: Base64.encode(password)})).hash;

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
    const client = await ton.getClient(server);
    const key = (await client.crypto.sha256({data: Base64.encode(password)})).hash;
    const decryptedData = (await client.crypto.chacha20({data, key, nonce})).data;
    return Base64.decode(decryptedData);
  }
}
