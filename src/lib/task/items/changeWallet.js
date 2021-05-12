import database from "@/db";

export default {
  name: 'changeWallet',
  handle: async function (i18n, task) {
    const {walletId} = task.data;
    const db = await database.getClient();
    await db.param.update('wallet', {value: walletId});
  }
}
