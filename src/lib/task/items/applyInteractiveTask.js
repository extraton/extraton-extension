import walletLib from '@/lib/wallet';
import {walletRepository} from "@/db/repository/walletRepository";
import {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';
import database from '@/db';
import insufficientFundsException from "@/lib/task/exception/insufficientFundsException";
import keystoreException from "@/lib/keystore/keystoreException";
import keystoreLib from "@/lib/keystore";

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
    const {interactiveTaskId, password, form} = task.data;
    let interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.new) {
      interactiveTask.statusId = interactiveTaskStatus.process;
      interactiveTask.error = null;
      await interactiveTaskRepository.updateTasks([interactiveTask]);

      let result = {};
      try {
        const db = await database.getClient();
        const wallet = await walletRepository.getCurrent();
        const server = (await db.network.get(interactiveTask.networkId)).server;
        if (wallet.isKeysEncrypted) {
          wallet.keys = await keystoreLib.decrypt(server, wallet.keys, password);
        }
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
            // const payload = form.comment !== ''
            //   ? await walletLib.createTransferPayload(server, form.comment)
            //   : '';
            // const message = await walletLib.createTransferMessage(
            //   server,
            //   wallet,
            //   wallet.address,
            //   form.address,
            //   nanoAmount.toString(),
            //   false,
            //   payload
            // );
            // const processingState = await TonApi.sendMessage(server, message);
            // await TonApi.waitForRunTransaction(server, message, processingState);
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
        } else if (e instanceof keystoreException) {
          interactiveTask.error = e.message;
        } else {
          interactiveTask.error = 'Error';
        }
        throw e;
      } finally {
        await interactiveTaskRepository.updateTasks([interactiveTask]);
      }
    }

    const interactiveTasks = await interactiveTaskRepository.getAll();

    return {interactiveTasks, interactiveTask};
  }
}
