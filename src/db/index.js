import Dexie from "dexie";

const DB_NAME = 'db41';

const _ = {
  setSchema: function (db) {
    db.version(1).stores({
      param: '&key, value',
      wallet: '++id, name, contractId, address, keys, networks, isRestored, isWalletMine',
      network: '&id, server, explorer, info, isDev, faucet.address, faucet.isGettingTokens',
      interactiveTask: '++id, networkId, requestId, data, params, typeId, statusId, result, error, form',
    });
  },
  fillInitial: async function (db) {
    await db.transaction('rw', db.param, db.network, async function () {
      await db.param.bulkAdd([
        {key: 'wallet', value: null},
        {key: 'network', value: 1},
      ]);
      await db.network.bulkAdd([
        {
          id: 1,
          server: 'main.ton.dev',
          explorer: 'ton.live',
          info: 'The main network',
          isDev: false,
          account: {balance: null, codeHash: null},
        },
        {
          id: 2,
          server: 'net.ton.dev',
          explorer: 'net.ton.live',
          info: 'Test network',
          isDev: true,
          faucet: {
            address: '0:553b3ea098c3bae9a60d9b689beb183c3cf9a5e6bc5f20acf34d5edfa49a31c1',
            isGettingTokens: false,
            isAvailable: true,
          },
          account: {balance: null, codeHash: null},
        },
      ]);
    });
  },
};

export default {
  getClient: async function () {
    const isInited = await Dexie.exists(DB_NAME);
    const db = new Dexie(DB_NAME);
    _.setSchema(db);
    await db.open();
    if (!isInited) {
      await _.fillInitial(db);
    }
    return db;
  },
};
