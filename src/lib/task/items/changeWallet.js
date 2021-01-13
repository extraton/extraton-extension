import database from "@/db";

export default {
  name: 'changeWallet',
  handle: async function (task) {
    const {walletId} = task.data;
    const db = await database.getClient();
    await db.param.update('wallet', {value: walletId});
  }
}
