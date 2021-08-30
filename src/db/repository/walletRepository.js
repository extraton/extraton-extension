import database from '@/db';
import {networkRepository} from '@/db/repository/networkRepository';
import walletLib from '@/lib/wallet';
import {paramRepository} from "@/db/repository/paramRepository";

const _ = {
  indexEntitiesByField(entities, field) {
    let result = {};
    for (const element of entities) {
      result[element[field]] = element;
    }
    return result;
  }
};

const walletRepository = {
  async create(contractId, address, keys, isRestored) {
    const db = await database.getClient();
    const dbNetworks = await networkRepository.getAll();
    let networks = {};
    // eslint-disable-next-line no-unused-vars
    for (const [id, dbNetwork] of Object.entries(dbNetworks)) {
      networks[id] = {
        codeHash: null,
        balance: null,
      };
    }
    const isWalletMine = null;
    let wallet = {name: '', contractId, address, keys, networks, isRestored, isWalletMine};
    wallet.id = await db.wallet.add(wallet);
    return wallet;
  },
  async updateName(wallet) {
    const db = await database.getClient();
    await db.wallet.update(wallet.id, {name: wallet.name});
  },
  async setWalletIsMine(wallet) {
    const db = await database.getClient();
    await db.wallet.update(wallet.id, {isWalletMine: true});
  },
  async remove(walletId) {
    const db = await database.getClient();
    await db.wallet.where('id').equals(walletId).delete();
  },
  async getCurrent() {
    const db = await database.getClient();
    const walletId = await paramRepository.get('wallet');
    if (null === walletId) {
      throw "Wallet isn't set.";
    }
    const wallet = await db.wallet.get(walletId);
    wallet.isKeysEncrypted = walletLib.isKeysEncrypted(wallet.keys);
    return wallet;
  },
  async getById(id) {
    const db = await database.getClient();
    return await db.wallet.get(id);
  },
  async getAllWithoutKeys() {
    const db = await database.getClient();
    const wallets = await db.wallet.orderBy('id').toArray();
    let walletsWithoutKeys = [];
    for (const wallet of wallets) {
      walletsWithoutKeys.push({
        id: wallet.id,
        name: wallet.name,
        contractId: wallet.contractId,
        address: wallet.address,
        networks: wallet.networks,
        isRestored: wallet.isRestored,
        isWalletMine: wallet.isWalletMine,
        pubkey: wallet.keys.public,
        isKeysEncrypted: walletLib.isKeysEncrypted(wallet.keys),
      });
    }
    return _.indexEntitiesByField(walletsWithoutKeys, 'id');
  },
  async updateNetworkData(wallet, networkId, balance, codeHash) {
    const db = await database.getClient();
    wallet.networks[networkId].balance = balance;
    wallet.networks[networkId].codeHash = codeHash;
    await db.wallet.update(wallet, {networks: wallet.networks});
  }
};

export {
  walletRepository,
};
