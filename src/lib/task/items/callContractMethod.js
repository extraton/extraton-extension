import database from "@/db";
import tonLib from "@/api/tonSdk";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {walletRepository} from "@/db/repository/walletRepository";
import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import callRestrictionLib from "@/lib/callRestriction";
import CheckCallRestrictionException from "@/lib/callRestriction/CheckCallRestrictionException";

export default {
  name: 'callContractMethod',
  handle: async function (task) {
    const {address, abi, method, input} = task.data;
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const server = (await db.network.get(networkId)).server;
    const wallet = await walletRepository.getCurrent();

    const account = await tonLib.requestAccountData(server, address);
    if (null === account) {
      throw new handleException(handleExceptionCodes.accountNotExists.code);
    }

    try {
      callRestrictionLib.check(wallet.address, account, method);
    } catch (e) {
      if (e instanceof CheckCallRestrictionException) {
        throw new handleException(handleExceptionCodes.callingContractMethodRestricted.code, e.toString());
      } else {
        throw e;
      }
    }

    let fees;
    if (wallet.isKeysEncrypted) {
      fees = null; //@TODO calculate fees when use keystore file
    } else {
      const contractAbi = tonLib.compileContractAbi(abi);
      const accountForExecutor = {type: 'Account', boc: account.boc, unlimited_balance: true};
      const message = await tonLib.encodeMessage(server, address, contractAbi, method, input, wallet.keys);
      const executorResult = await tonLib.runExecutor(server, message.message, accountForExecutor, contractAbi);
      fees = walletLib.convertFromNano(executorResult.fees.total_account_fees, 9);
    }

    if (!await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    }

    const data = {fees};
    return await interactiveTaskRepository.createTask(interactiveTaskType.callContractMethod, networkId, task.requestId, task.data, data);
  }
}
