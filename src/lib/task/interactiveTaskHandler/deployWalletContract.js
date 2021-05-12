import {interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import walletContractLib from "@/lib/walletContract";
import tonLib from "@/api/tonSdk";

export default {
  id: interactiveTaskType.deployWalletContract,
  async prepare(server, form, wallet, keys) {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const constructorParams = {owners: [`0x${wallet.keys.public}`], reqConfirms: 1};
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const message = await tonLib.encodeDeployMessage(server, abi, walletContract.imageBase64, {}, constructorParams, keys);

    const accountForExecutor = {type: 'Uninit'};
    const executorResult = await tonLib.runExecutor(server, message.message, accountForExecutor, abi);
    const fee = executorResult.fees.total_account_fees.toString();

    return {message, fee};
  },
  calcAmountWithFee(preparation) {
    return preparation.fee;
  },
  async apply(server, wallet, message) {
    const walletContract = walletContractLib.getContractById(wallet.contractId);
    const abi = tonLib.compileContractAbi(walletContract.abi);
    const shardBlockId = await tonLib.sendMessage(server, message.message, abi);
    await tonLib.waitForTransaction(server, message.message, abi, shardBlockId);
    return {};
  }
}
