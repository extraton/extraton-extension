import database from "@/db";
import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import TonApi from '@/api/ton';
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";

export default {
  name: 'run',
  handle: async function (task) {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;
    const keys = (await db.param.get('keys')).value;
    const address = (await db.param.get('address')).value;

    if (task.data.address === address) {
      throw new handleException(handleExceptionCodes.prohibitedToRunWalletContract.code);
    }

    if (!await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    }

    const runFees = await TonApi.calcRunFees(server, task.data.address, task.data.method, task.data.abi, task.data.params, keys);
    const fees = walletLib.convertFromNano(parseInt(runFees.fees.totalAccountFees) + parseInt(runFees.fees.totalOutput));
    const data = {fees};

    return await interactiveTaskRepository.createTask(interactiveTaskType.runTransaction, networkId, task.requestId, task.data, data);
  }
}