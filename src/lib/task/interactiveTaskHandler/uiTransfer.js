import {interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import tonLib from "@/api/tonSdk";
import interactiveTaskHandleException from "@/lib/task/exception/interactiveTaskHandleException";
import walletLib from "@/lib/wallet";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import walletContractLib from "@/lib/walletContract";
import BN from "bignumber.js";

export default {
  id: interactiveTaskType.uiTransfer,
  async prepare(server, form, wallet, keys) {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const abi = tonLib.compileContractAbi(walletContract.abi);

    let address;
    try {
      address = await tonLib.convertAddress(server, form.address);
    } catch (e) {
      throw new interactiveTaskHandleException('Incorrect address');
    }
    const nanoAmount = walletLib.convertToNano(form.amount).toFixed();
    const payload = form.comment !== ''
      ? await walletLib.createTransferPayload(server, form.comment)
      : '';
    const input = {dest: address, value: nanoAmount, bounce: false, allBalance: false, payload};
    const message = await tonLib.encodeMessage(server, wallet.address, abi, 'submitTransaction', input, keys);

    const account = await tonLib.requestAccountData(server, wallet.address);
    if (null === account) {
      throw new handleException(handleExceptionCodes.accountNotExists.code);
    }
    const accountForExecutor = {type: 'Account', boc: account.boc, unlimited_balance: true};
    const executorResult = await tonLib.runExecutor(server, message.message, accountForExecutor, abi);
    const fee = executorResult.fees.total_account_fees.toString();

    return {message, fee, address, nanoAmount};
  },
  calcAmountWithFee(preparation) {
    return BN(preparation.fee).plus(BN(preparation.nanoAmount)).toFixed();
  },
  async apply(server, wallet, message) {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const abi = tonLib.compileContractAbi(walletContract.abi);
      const shardBlockId = await tonLib.sendMessage(server, message.message, abi);

    await tonLib.waitForTransaction(server, message.message, abi, shardBlockId);
    return {};
  }
}
