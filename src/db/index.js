import Dexie from "dexie";
import {routes} from "@/plugins/router";

const DB_NAME = 'db4';

const _ = {
  setSchema: function (db) {
    db.version(1).stores({
      param: '&key, value',
      wallet: '++id, name, contractId, address, keys, seed, networks, isRestored, isWalletMine',
      network: '&id, server, explorer, info, isDev',
      interactiveTask: '++id, networkId, requestId, data, params, typeId, statusId, result, error, form, preparation',
    });
  },
  fillInitial: async function (db) {
    const networks = [
      {
        id: 1,
        server: 'main.ton.dev',
        explorer: 'ton.live',
        isDev: false,
        account: {balance: null, codeHash: null},
      },
      {
        id: 2,
        server: 'net.ton.dev',
        explorer: 'net.ton.live',
        isDev: true,
        account: {balance: null, codeHash: null},
      },
    ];
    const params = [
      {key: 'wallet', value: null},
      {key: 'network', value: 1},
      {key: 'page', value: {name: routes.start, params: {}}},
      {key: 'pass', value: null},
      {key: 'language', value: 'en'},
    ];
    for (const network of networks) {
      const isExists = typeof await db.network.get(network.id) !== 'undefined';
      if (!isExists) {
        await db.network.add(network);
      }
    }
    for (const param of params) {
      const isExists = typeof await db.param.get(param.key) !== 'undefined';
      if (!isExists) {
        await db.param.add(param);
      }
    }
  },
};

export default {
  init: async function () {
    const db = new Dexie(DB_NAME);
    _.setSchema(db);
    await db.open();
    await _.fillInitial(db);
  },
  getClient: async function () {
    const db = new Dexie(DB_NAME);
    _.setSchema(db);
    await db.open();
    return db;
  }
};
