import Dexie from "dexie";

const DB_NAME = 'db35';

const _ = {
  setSchema: function (db) {
    db.version(1).stores({
      param: '&key, value',
      network: '&id, server, explorer, info, isDev, faucet.address, faucet.isGettingTokens, account.balance, account.codeHash',
      interactiveTask: '++id, networkId, requestId, params, typeId, statusId, result, error, form',
    });
  },
  fillInitial: async function (db) {
    await db.transaction('rw', db.param, db.network, async function () {
      await db.param.bulkAdd([
        {key: 'address', value: null},
        {key: 'network', value: 1},
        {key: 'keys', value: null},
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
            address: '0:553b3ea098c3bae9a60d9b689beb183c3cf9a5e6bc5f20acf34d5edfa49a31c1',//our own
            // address: '0:3cf3fe44e76de070048e42a73cebd36d16b6ef82374d49717cb79751a9f28faa',//tonlabs
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
