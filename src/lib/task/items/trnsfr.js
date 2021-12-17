import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'trnsfr',
  handle: async function (task) {
    const networkId = await paramRepository.get('network');

    if (networkId !== task.data.network.id) {
      throw new handleException(handleExceptionCodes.networkChanged.code);
    }

    const loggedWalletAddress = await walletLib.getWalletAddress();

    if (undefined === task.data.walletAddress) {
      task.data.walletAddress = loggedWalletAddress;
    }

    const isItLoggedWalletAddress = walletLib.isAddressesMatch(loggedWalletAddress, task.data.walletAddress);

    if (isItLoggedWalletAddress && !await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    }

    return await interactiveTaskRepository.createTask(interactiveTaskType.trnsfr, networkId, task.requestId, task.data, {isItLoggedWalletAddress}, task.isAutoConfirm);
  }
}
