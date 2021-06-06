import walletLib from "@/lib/wallet";

export default {
  name: 'hasSigner',
  isLoginRequired: false,
  handle: async function () {
    return await walletLib.isLoggedIn();
  }
}
