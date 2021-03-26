import Dexie from "dexie";
import {routes} from "@/plugins/router";

const DB_NAME = 'db41';

const _ = {
  setSchema: function (db) {
    db.version(9).stores({
      param: '&key, value',
      wallet: '++id, name, contractId, address, keys, networks, isRestored, isWalletMine',
      network: '&id, server, explorer, info, isDev',
      interactiveTask: '++id, networkId, requestId, data, params, typeId, statusId, result, error, form',
      token: '++id, contractId, networkId, walletId, rootAddress, name, symbol, isDeploying, walletAddress, balance, decimals, params',
    });
  },
  fillInitial: async function (db) {
    await db.transaction('rw', db.param, db.network, async function () {
      await db.param.bulkAdd([
        {key: 'wallet', value: null},
        {key: 'network', value: 1},
        {key: 'tip3', value: false},
        {key: 'page', value: {name: routes.start, params: {}}},
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
