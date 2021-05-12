import keystoreLib from "@/lib/keystore";
import {walletRepository} from "@/db/repository/walletRepository";
import database from "@/db";

export default {
  name: 'decryptPrivateKey',
  handle: async function (i18n, task) {
    const db = await database.getClient();
    const {password, walletId} = task.data;
    const server = (await db.network.get(1)).server;
    let wallet = await walletRepository.getById(walletId);
    const keys = await keystoreLib.decrypt(i18n, server, wallet.keys, password, keystoreLib.matchers.keySecret);
    return keys.secret;
  }
}
