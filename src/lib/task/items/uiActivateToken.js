import {tokenRepository} from "@/db/repository/tokenRepository";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import tokenContractLib from "@/lib/token/contract";
import database from "@/db";
import {walletRepository} from "@/db/repository/walletRepository";
import walletLib from "@/lib/wallet";

export default {
  name: 'uiActivateToken',
  handle: async function (task) {
    const {networkId, tokenId} = task.data;
    const db = await database.getClient();
    const network = await db.network.get(networkId);
    const token = await tokenRepository.getToken(tokenId);
    const wallet = await walletRepository.getCurrent();

    if (null !== token.walletAddress) {
      throw new handleException(handleExceptionCodes.tokenAlreadyActive.code);
    }

    const contract = await tokenContractLib.getContractById(token.contractId);

    if (!await walletLib.isContractDeployed(network.id)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, network.id, task.requestId);
    }

    await contract.initTokenActivation(network, token, task.requestId, wallet);


    const tasks = await interactiveTaskRepository.getAll();
    return {tasks};
  }
}
