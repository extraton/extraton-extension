import database from "@/db";
import walletLib from "@/lib/wallet";
import {interactiveTaskRepository, interactiveTaskType} from "@/db/repository/interactiveTaskRepository";
// import TonApi from '@/api/ton';

export default {
  name: 'deploy',
  handle: async function (task) {
    //@TODO validate task.data
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    // const server = (await db.network.get(networkId)).server;

    if (!await walletLib.isContractDeployed(networkId)) {
      await interactiveTaskRepository.createTask(interactiveTaskType.deployWalletContract, networkId, task.requestId);
    }

    // @TODO
    // const initParams = task.data.options.initParams !== undefined ? task.data.options.initParams : {};
    // const contract = {abi: task.data.abi, imageBase64: task.data.imageBase64};
    // const deployFees = await TonApi.calcDeployFees(server, keys, contract, initParams, task.data.constructorParams);
    // console.log({deployFees});


    await interactiveTaskRepository.createTask(interactiveTaskType.preDeployTransfer, networkId, task.requestId, task.data);

    return await interactiveTaskRepository.createTask(interactiveTaskType.deployContract, networkId, task.requestId, task.data);
  }
}
