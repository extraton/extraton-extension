import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {tokenRepository} from "@/db/repository/tokenRepository";
import {walletRepository} from "@/db/repository/walletRepository";
import {paramRepository} from "@/db/repository/paramRepository";
import tokenContractLib from "@/lib/token/contract";
import {networkRepository} from "@/db/repository/networkRepository";
import {tokenContractException, tokenContractExceptionCodes} from "@/lib/token/TokenContractException";

export default {
  name: 'addToken',
  handle: async function (task) {
    const networkId = await paramRepository.get('network');
    const network = await networkRepository.getById(networkId);
    const rootAddress = task.data.rootAddress;//@TODO validate

    if (networkId !== task.data.network.id) {
      throw new handleException(handleExceptionCodes.networkChanged.code);
    }
    const currentWallet = await walletRepository.getCurrent();
    if (!walletLib.isAddressesMatch(currentWallet.address, task.data.walletAddress)) {
      throw new handleException(handleExceptionCodes.walletChanged.code);
    }

    let contract;
    try {
      contract = await tokenContractLib.getContractByAddress(network.server, rootAddress);
    } catch (e) {
      const codes = [tokenContractExceptionCodes.notExists.code, tokenContractExceptionCodes.itIsNotToken.code];
      if (e instanceof tokenContractException && codes.includes(e.code)) {
        throw new handleException(handleExceptionCodes.tokenNotFoundOrNotSupporting.code);
      }
      throw e;
    }

    let token = await tokenRepository.findOneByWalletAndNetworkAndRootAddress(currentWallet.id, networkId, task.data.rootAddress);
    if (null !== token) {
      throw new handleException(handleExceptionCodes.tokenAlreadyAdded.code);
    }

    const tokenData = await contract.contract.getTokenData(network.server, contract.boc, rootAddress, currentWallet.keys.public);

    return await interactiveTaskRepository.createTask(interactiveTaskType.addToken, networkId, task.requestId, task.data, {
      name: tokenData.name,
      symbol: tokenData.symbol,
    });
  }
}
