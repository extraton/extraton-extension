import {tokenRepository} from "@/db/repository/tokenRepository";
import createNewEmptyTokenWalletFpa from "@/lib/task/interactive/frontPostApply/createNewEmptyTokenWallet";

export default {
  name: 'createNewEmptyTokenWallet',
  handle: async function (server, tokenId) {
    let token = await tokenRepository.getToken(tokenId);
    token.isDeploying = true;
    await tokenRepository.setIsDeploying(token);

    const tokens = await tokenRepository.getAll();
    const frontPostApply = {name: createNewEmptyTokenWalletFpa.name, params: [tokens]};

    return frontPostApply;
  }
}
