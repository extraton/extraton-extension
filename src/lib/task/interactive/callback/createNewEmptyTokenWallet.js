// import tonLib from "@/api/tonSdk";
// import dexClientAbi from "@/lib/token/tip3/radiance/DEXclient.abi.json";
import {tokenRepository} from "@/db/repository/tokenRepository";
import createNewEmptyTokenWallet from "@/lib/task/interactive/frontPostApply/createNewEmptyTokenWallet";

export default {
  name: 'createNewEmptyTokenWallet',
  handle: async function (server, tokenId) {
    let token = await tokenRepository.getToken(tokenId);
    token.isDeploying = true;
    await tokenRepository.setIsDeploying(token);
    // const dexClient = await tonLib.requestAccountData(server, dexClientAddress);
    // const message = await tonLib.encodeMessage(
    //   server,
    //   dexClientAddress,
    //   dexClientAbi,
    //   'getWalletByRoot',
    //   {rootAddr: token.rootAddress},
    // );
    // token.walletAddress = (await tonLib.runTvm(server, dexClientAbi, dexClient.boc, message.message)).wallet;
    // await tokenRepository.updateWalletAddress(token);

    const tokens = await tokenRepository.getAll();
    const frontPostApply = {name: createNewEmptyTokenWallet.name, params: [tokens]};

    return frontPostApply;
  }
}
