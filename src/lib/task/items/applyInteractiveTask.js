import walletLib from '@/lib/wallet';
import {walletRepository} from "@/db/repository/walletRepository";
import {
  interactiveTaskType,
  interactiveTaskStatus,
  interactiveTaskRepository,
} from '@/db/repository/interactiveTaskRepository';
import TonApi from "@/api/ton";
import database from '@/db';

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
            await walletLib.deploy(server, wallet);
            break;
          }
          case interactiveTaskType.uiTransfer: {
            const nanoAmount = walletLib.convertToNano(form.amount).toString();
            await walletLib.transfer(server, wallet, form.address, nanoAmount);
            break;
          }
          case interactiveTaskType.preDeployTransfer: {
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            const address = await TonApi.predictAddress(server, wallet.keys.public, interactiveTask.params.abi, interactiveTask.params.imageBase64, initParams);
            await walletLib.transfer(server, wallet, address, interactiveTask.params.options.initAmount);
            break;
          }
          case interactiveTaskType.deployContract: {
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
        interactiveTask.error = 'Error';
        throw e;
      } finally {
        await interactiveTaskRepository.updateTasks([interactiveTask]);
      }
    }
    return await interactiveTaskRepository.getAll();
  }
}
