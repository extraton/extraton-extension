import {tokenRepository} from "@/db/repository/tokenRepository";
import tokenContractLib from "@/lib/token/contract";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import walletLib from "@/lib/wallet";
import database from "@/db";
import compileApiView from "@/lib/token/compileApiView";

export default {
  name: 'getTokenList',
  isLoginRequired: true,
  handle: async function (task) {
    const db = await database.getClient();
    const walletId = (await db.param.get('wallet')).value;
    const networkId = (await db.param.get('network')).value;

    if (networkId !== task.data.network.id) {
      throw new handleException(handleExceptionCodes.networkChanged.code);
    }

    const loggedWalletAddress = await walletLib.getWalletAddress();
    if (!walletLib.isAddressesMatch(loggedWalletAddress, task.data.walletAddress)) {
      throw new handleException(handleExceptionCodes.walletChanged.code);
    }

    const tokens = await tokenRepository.getByWalletAndNetwork(walletId, networkId);
    let tokenList = [];
    for (const token of tokens) {
      const contract = tokenContractLib.getContractById(token.contractId);
      tokenList.push(compileApiView(contract, token));
    }

    return tokenList;
  }
}
