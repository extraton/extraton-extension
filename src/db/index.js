import Dexie from "dexie";
import {routes} from "@/plugins/router";

const DB_NAME = 'db41';

const _ = {
  client: null,
  setSchema: function (db) {
    db.version(11).stores({
      param: '&key, value',
      wallet: '++id, name, contractId, address, keys, networks, isRestored, isWalletMine',
      network: '&id, server, explorer, info, isDev',
      interactiveTask: '++id, networkId, requestId, data, params, typeId, statusId, result, error, form',
      token: '++id, contractId, networkId, walletId, rootAddress, name, symbol, isDeploying, walletAddress, balance, decimals, params',
      subscriber: '++id, &tabId'
    });
  },
  fillInitial: async function (db) {
    const networks = [
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
    ];
    const params = [
      {key: 'wallet', value: null},
      {key: 'network', value: 1},
      {key: 'tip3', value: false},
      {key: 'hideAddrCopyWarning', value: false},
      {key: 'page', value: {name: routes.start, params: {}}},
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
    await db.close();
  },
  getClient: async function () {
    if (null === _.client) {
      _.client = new Dexie(DB_NAME);
      _.setSchema(_.client);
      await _.client.open();
    }
    return _.client;
  },
  fresh: async function () {
    let client = await this.getClient();
    await client.delete();
    await client.close();
    _.client = null;
    await this.init();
  }
};
