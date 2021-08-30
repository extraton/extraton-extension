import walletLib from "@/lib/wallet";
import {walletRepository} from "@/db/repository/walletRepository";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
// import TonApi from '@/api/ton';
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'run',
  handle: async function (task) {
    const networkId = await paramRepository.get('network');
    // const server = (await db.network.get(networkId)).server;
    const wallet = await walletRepository.getCurrent();

    if (task.data.address.toLowerCase() === wallet.address.toLowerCase()) {
      throw new handleException(handleExceptionCodes.prohibitedToRunWalletContract.code);
    }

    if (!await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    }

    //@TODO FEES. Impossible to count with keystore file...
    // const runFees = await TonApi.calcRunFees(server, task.data.address, task.data.method, task.data.abi, task.data.params, wallet.keys);
    // const fees = walletLib.convertFromNano(parseInt(runFees.fees.totalAccountFees) + parseInt(runFees.fees.totalOutput));
    const fees = '0.017518294'
    const data = {fees};

    return await interactiveTaskRepository.createTask(interactiveTaskType.runTransaction, networkId, task.requestId, task.data, data);
  }
}
