import database from "@/db";
import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
import {handleException, handleExceptionCodes} from "@/lib/task/exception/handleException";
import {tokenRepository} from "@/db/repository/tokenRepository";
import {walletRepository} from "@/db/repository/walletRepository";

export default {
  name: 'transferToken',
  handle: async function (task) {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;

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
    if (null === token.walletAddress) {
      throw new handleException(handleExceptionCodes.tokenNotActive.code);
    }

    //TODO validate 'address' and 'amount'
    //TODO fee
    const amountView = walletLib.convertToView(task.data.amount, token.decimals, token.decimals);
    const balanceView = walletLib.convertToView(token.balance, token.decimals);
    return await interactiveTaskRepository.createTask(interactiveTaskType.transferToken, networkId, task.requestId, task.data, {
      tokenId: token.id,
      tokenName: token.name,
      tokenSymbol: token.symbol,
      balanceView,
      amountView,
    });
  }
}
