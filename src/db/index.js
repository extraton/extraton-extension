import Dexie from "dexie";

const DB_NAME = 'db16';

const _ = {
  setSchema: function (db) {
    db.version(1).stores({
      param: '&key, value',
      network: '&id, server, explorer, info, isDev, faucet.address, faucet.isGettingTokens, account.balance, account.codeHash',
      interactiveTask: '++id, networkId, type',
    });
  },
  fillInitial: async function (db) {
    await db.transaction('rw', db.param, db.network, async function () {
      await db.param.bulkAdd([
        {key: 'address', value: null},
        {key: 'network', value: 0},
        {key: 'keys', value: null},
      ]);
      await db.network.bulkAdd([
        {
          id: 0,
          server: 'main.ton.dev',
          explorer: 'ton.live',
          info: 'The main network',
          isDev: false,
          account: {balance: null, codeHash: null},
        },
        {
          id: 1,
          server: 'net.ton.dev',
          explorer: 'net.ton.live',
          info: 'Test network',
          isDev: true,
          faucet: {
            address: '0:3cf3fe44e76de070048e42a73cebd36d16b6ef82374d49717cb79751a9f28faa',
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
