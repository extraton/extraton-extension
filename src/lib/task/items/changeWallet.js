import walletLib from "@/lib/wallet";

export default {
  name: 'changeWallet',
  handle: async function (task) {
    const {walletId} = task.data;
    await walletLib.changeWallet(walletId);
  }
}
