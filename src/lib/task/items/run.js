import database from "@/db";
import walletLib from "@/lib/wallet";
import {walletRepository} from "@/db/repository/walletRepository";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import TonApi from '@/api/ton';
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";

export default {
  name: 'run',
  handle: async function (task) {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;
    const wallet = await walletRepository.getCurrent();

    if (task.data.address.toLowerCase() === wallet.address.toLowerCase()) {
      throw new handleException(handleExceptionCodes.prohibitedToRunWalletContract.code);
    }

    if (!await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    }

    const runFees = await TonApi.calcRunFees(server, task.data.address, task.data.method, task.data.abi, task.data.params, wallet.keys);
    const fees = walletLib.convertFromNano(parseInt(runFees.fees.totalAccountFees) + parseInt(runFees.fees.totalOutput));
    const data = {fees};

    return await interactiveTaskRepository.createTask(interactiveTaskType.runTransaction, networkId, task.requestId, task.data, data);
  }
}
