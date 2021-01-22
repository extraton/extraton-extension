import walletLib from '@/lib/wallet';
import {walletRepository} from "@/db/repository/walletRepository";
import {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';
import TonApi from "@/api/ton";
import database from '@/db';
import insufficientFundsException from "@/lib/task/exception/insufficientFundsException";

const _ = {
  checkSufficientFunds(wallet, networkId, amount) {
    const balance = BigInt(wallet.networks[networkId].balance);
    if (balance < amount) {
      throw new insufficientFundsException();
    }
  }
}

export default {
  name: 'applyInteractiveTask',
  async handle(task) {
    const {interactiveTaskId, form} = task.data;
    let interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.new) {
      interactiveTask.statusId = interactiveTaskStatus.process;
      interactiveTask.error = null;
      await interactiveTaskRepository.updateTasks([interactiveTask]);

      let result = {};
      try {
        //@TODO refactoring
        const db = await database.getClient();
        const wallet = await walletRepository.getCurrent();
        const server = (await db.network.get(interactiveTask.networkId)).server;
        switch (interactiveTask.typeId) {
          case interactiveTaskType.deployWalletContract: {
            //TODO FEES
            const amountWithFee = BigInt('73000000');
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            await walletLib.deploy(server, wallet);
            break;
          }
          case interactiveTaskType.uiTransfer: {
            const nanoAmount = walletLib.convertToNano(form.amount);
            //TODO FEES
            const amountWithFee = BigInt('11000000') + nanoAmount;
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const payload = form.comment !== ''
              ? await walletLib.createTransferPayload(server, form.comment)
              : '';
            const message = await walletLib.createTransferMessage(
              server,
              wallet,
              wallet.address,
              form.address,
              nanoAmount.toString(),
              false,
              payload
            );
            const processingState = await TonApi.sendMessage(server, message);
            await TonApi.waitForRunTransaction(server, message, processingState);
            break;
          }
          case interactiveTaskType.preDeployTransfer: {
            //TODO FEES
            const amountWithFee = BigInt('11000000') + BigInt(interactiveTask.params.options.initAmount);
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            const address = await TonApi.predictAddress(server, wallet.keys.public, interactiveTask.params.abi, interactiveTask.params.imageBase64, initParams);
            await walletLib.transfer(server, wallet, address, interactiveTask.params.options.initAmount);
            break;
          }
          case interactiveTaskType.deployContract: {
            const amountWithFee = BigInt('73000000');
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            result = await walletLib.deployContract(server, wallet, interactiveTask.params.abi, interactiveTask.params.imageBase64, initParams, interactiveTask.params.constructorParams);
            break;
          }
          case interactiveTaskType.runTransaction: {
            const message = await TonApi.createRunMessage(server, interactiveTask.params.address, interactiveTask.params.abi, interactiveTask.params.method, interactiveTask.params.params, wallet.keys);
            const processingState = await TonApi.sendMessage(server, message);
            const txid = await TonApi.waitForRunTransaction(server, message, processingState);
            result = {txid};
            break;
          }
          case interactiveTaskType.transfer: {
            const amountWithFee = BigInt('11000000') + BigInt(interactiveTask.params.amount);
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const message = await walletLib.createTransferMessage(
              server,
              wallet,
              interactiveTask.params.walletAddress,
              interactiveTask.params.address,
              interactiveTask.params.amount,
              interactiveTask.params.bounce,
              interactiveTask.params.payload || ''
            );
            const processingState = await TonApi.sendMessage(server, message);
            result = {processingState, message};
            break;
          }
          case interactiveTaskType.confirmTransaction: {
            const message = await walletLib.createConfirmTransactionMessage(
              server,
              wallet,
              interactiveTask.params.walletAddress,
              interactiveTask.params.txid,
            );
            const processingState = await TonApi.sendMessage(server, message);
            result = {processingState, message};
            break;
          }
          default: {
            throw 'Unknown interactive type.';
          }
        }
        interactiveTask.statusId = interactiveTaskStatus.performed;
        interactiveTask.result = result;
      } catch (e) {
        console.error(e);
        interactiveTask.statusId = interactiveTaskStatus.new;
        if (e instanceof insufficientFundsException) {
          interactiveTask.error = e.error;
        } else {
          interactiveTask.error = 'Error';
        }
        throw e;
      } finally {
        await interactiveTaskRepository.updateTasks([interactiveTask]);
      }
    }
    return await interactiveTaskRepository.getAll();
  }
}
