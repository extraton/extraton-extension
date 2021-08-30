import {tokenRepository} from "@/db/repository/tokenRepository";
import tokenContractLib from "@/lib/token/contract";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import walletLib from "@/lib/wallet";
import compileApiView from "@/lib/token/compileApiView";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'getTokenList',
  isLoginRequired: true,
  handle: async function (task) {
    const walletId = await paramRepository.get('wallet');
    const networkId = await paramRepository.get('network');

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
