import {walletRepository} from "@/db/repository/walletRepository";
import {
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';
import database from '@/db';
import insufficientFundsException from "@/lib/task/exception/insufficientFundsException";
import keystoreException from "@/lib/keystore/keystoreException";
import keystoreLib from "@/lib/keystore";
import interactiveTaskHandler from "@/lib/task/interactiveTaskHandler";
import interactiveTaskHandleException from "@/lib/task/exception/interactiveTaskHandleException";
import {tonException, tonExceptionCodes} from "@/api/exception/tonException";

const _ = {
  checkSufficientFunds(i18n, wallet, networkId, amount) {
    const balance = BigInt(wallet.networks[networkId].balance);
    if (balance < amount) {
      throw new insufficientFundsException(i18n);
    }
  }
}

export default {
  name: 'applyInteractiveTask',
  async handle(i18n, task) {
    const {interactiveTaskId, password, form} = task.data;
    let interactiveTask = await interactiveTaskRepository.getTask(interactiveTaskId);
    if ([interactiveTaskStatus.new, interactiveTaskStatus.prepared].includes(interactiveTask.statusId)) {
      const statusId = interactiveTask.statusId;
      interactiveTask.statusId = interactiveTaskStatus.process;
      interactiveTask.error = null;
      await interactiveTaskRepository.updateTasks([interactiveTask]);

      try {
        const db = await database.getClient();
        const wallet = await walletRepository.getCurrent();
        const server = (await db.network.get(interactiveTask.networkId)).server;
        const handler = interactiveTaskHandler.get(interactiveTask.typeId);

        if (interactiveTaskStatus.new === statusId) {
          const keys = await keystoreLib.decrypt(i18n, server, wallet.keys, password, keystoreLib.matchers.keySecret);
          interactiveTask.preparation = await handler.prepare(server, form, wallet, keys);
          interactiveTask.statusId = interactiveTaskStatus.prepared;
        } else if (interactiveTaskStatus.prepared === statusId) {
          _.checkSufficientFunds(i18n, wallet, interactiveTask.networkId, handler.calcAmountWithFee(interactiveTask.preparation));
          try {
            interactiveTask.result = await handler.apply(server, wallet, interactiveTask.preparation.message);
          } catch (e) {
            if (e instanceof tonException) {
              switch (e.code) {
                case tonExceptionCodes.messageExpired:
                  throw new interactiveTaskHandleException(i18n.t('actionDialog.messageExpired'));
                case tonExceptionCodes.syncTime:
                  throw new interactiveTaskHandleException(i18n.t('globalError.syncTime'));
              }
            }
            throw e;
          }
          interactiveTask.statusId = interactiveTaskStatus.performed;
        } else {
          throw `Unexpected interactive task status id: #${statusId}`;
        }
      } catch (e) {
        console.error(e);
        interactiveTask.statusId = statusId;
        if (e instanceof insufficientFundsException) {
          interactiveTask.error = e.error;
        } else if (e instanceof interactiveTaskHandleException) {
          interactiveTask.error = e.error;
        } else if (e instanceof keystoreException) {
          interactiveTask.error = e.message;
        } else {
          interactiveTask.error = 'Error';
        }
        // throw e;
      }/* finally {*/
      await interactiveTaskRepository.updateTasks([interactiveTask]);
      // }
    }

    const interactiveTasks = await interactiveTaskRepository.getAll();

    return {interactiveTasks, interactiveTask};
  }
}
