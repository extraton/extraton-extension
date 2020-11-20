import walletLib from '@/lib/wallet';
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
        switch (interactiveTask.typeId) {
          case interactiveTaskType.deployWalletContract: {
            await walletLib.deploy(interactiveTask.networkId);
            break;
          }
          case interactiveTaskType.uiTransfer: {
            const nanoAmount = walletLib.convertToNano(form.amount).toString();
            await walletLib.transfer(interactiveTask.networkId, form.address, nanoAmount);
            break;
          }
          case interactiveTaskType.preDeployTransfer: {
            const db = await database.getClient();
            const networkId = (await db.param.get('network')).value;
            const server = (await db.network.get(networkId)).server;
            const keys = (await db.param.get('keys')).value;
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            const address = await TonApi.predictAddress(server, keys.public, interactiveTask.params.abi, interactiveTask.params.imageBase64, initParams);
            await walletLib.transfer(interactiveTask.networkId, address, interactiveTask.params.options.initAmount);
            break;
          }
          case interactiveTaskType.deployContract: {
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            result = await walletLib.deployContract(interactiveTask.networkId, interactiveTask.params.abi, interactiveTask.params.imageBase64, initParams, interactiveTask.params.constructorParams);
            break;
          }
          case interactiveTaskType.runTransaction: {
            const db = await database.getClient();
            const networkId = (await db.param.get('network')).value;
            const server = (await db.network.get(networkId)).server;
            const keys = (await db.param.get('keys')).value;
            const message = await TonApi.createRunMessage(server, interactiveTask.params.address, interactiveTask.params.abi, interactiveTask.params.method, interactiveTask.params.params, keys);
            const processingState = await TonApi.sendMessage(server, message);
            const txid = await TonApi.waitForRunTransaction(server, message, processingState);
            result = {txid};
            break;
          }
          case interactiveTaskType.transfer: {
            result = await walletLib.transfer(
              interactiveTask.networkId,
              interactiveTask.params.address,
              interactiveTask.params.amount,
              interactiveTask.params.bounce,
              interactiveTask.params.payload || ''
            );
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
