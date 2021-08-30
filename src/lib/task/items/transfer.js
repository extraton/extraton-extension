import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {paramRepository} from "@/db/repository/paramRepository";
// import TonApi from '@/api/ton';

export default {
  name: 'transfer',
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

    return await interactiveTaskRepository.createTask(interactiveTaskType.transfer, networkId, task.requestId, task.data, {isItLoggedWalletAddress});
  }
}
