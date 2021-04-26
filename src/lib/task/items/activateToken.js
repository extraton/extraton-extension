import {tokenRepository} from "@/db/repository/tokenRepository";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import tokenContractLib from "@/lib/token/contract";
import walletLib from "@/lib/wallet";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {walletRepository} from "@/db/repository/walletRepository";
import {paramRepository} from "@/db/repository/paramRepository";
import {networkRepository} from "@/db/repository/networkRepository";

export default {
  name: 'activateToken',
  handle: async function (task) {
    const networkId = await paramRepository.get('network');
    const network = await networkRepository.getById(networkId);

    if (networkId !== task.data.network.id) {
      throw new handleException(handleExceptionCodes.networkChanged.code);
    }

    const currentWallet = await walletRepository.getCurrent();
    if (!walletLib.isAddressesMatch(currentWallet.address, task.data.walletAddress)) {
      throw new handleException(handleExceptionCodes.walletChanged.code);
    }

    const token = await tokenRepository.findOneByWalletAndNetworkAndRootAddress(currentWallet.id, networkId, task.data.rootAddress);
    if (null === token) {
      throw new handleException(handleExceptionCodes.tokenNotFound.code);
    }

    if (null !== token.walletAddress) {
      throw new handleException(handleExceptionCodes.tokenAlreadyActive.code);
    }

    const contract = await tokenContractLib.getContractById(token.contractId);

    if (!await walletLib.isContractDeployed(network.id)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, network.id, task.requestId);
    }

    return await contract.initTokenActivation(network, token, task.requestId, currentWallet);
  }
}
