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
import keystoreLib from "@/lib/keystore";
import keystoreException from "@/lib/keystore/keystoreException";
import interactiveTaskCallback from "@/lib/task/interactive/callback";
import tonLib from "@/api/tonSdk";
import {siteRepository} from "../../../db/repository/siteRepository";
import walletContractLib from '@/lib/walletContract';

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
        //@TODO refactoring
        const db = await database.getClient();
        const wallet = await walletRepository.getCurrent();
        const network = await db.network.get(interactiveTask.networkId);
        const server = network.server;
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
            const walletContract = walletContractLib.getContractById(wallet.contractId);
            const abi = tonLib.compileContractAbi(walletContract.abi);
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
            const shardBlockId = await tonLib.sendMessage(server, message, abi);
            await tonLib.waitForTransaction(server, message, abi, shardBlockId);
            break;
          }
          case interactiveTaskType.preDeployTransfer: {
            //TODO FEES
            const abi = tonLib.compileContractAbi(interactiveTask.params.abi);
            const amountWithFee = BigInt('11000000') + BigInt(interactiveTask.params.options.initAmount);
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            const initPubkey = interactiveTask.params.options.initPubkey !== undefined ? interactiveTask.params.options.initPubkey : null;
            const address = await tonLib.predictAddress(server, abi, interactiveTask.params.imageBase64, wallet.keys.public, 0, initParams, initPubkey);
            const message = await walletLib.createTransferMessage(
              server,
              wallet,
              wallet.address,
              address,
              interactiveTask.params.options.initAmount,
            );
            const shardBlockId = await tonLib.sendMessage(server, message, abi);
            await tonLib.waitForTransaction(server, message, abi, shardBlockId);
            break;
          }
          case interactiveTaskType.deployContract: {
            const amountWithFee = BigInt('73000000');
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            const initPubkey = interactiveTask.params.options.initPubkey !== undefined ? interactiveTask.params.options.initPubkey : null;
            const abi = tonLib.compileContractAbi(interactiveTask.params.abi);
            result = await walletLib.deployContract(server, wallet, abi, interactiveTask.params.imageBase64, initParams, interactiveTask.params.constructorParams, initPubkey);
            if (interactiveTask.params.async === false) {
              result = await tonLib.waitForTransaction(server, result.message.message, abi, result.shardBlockId);
            }
            break;
          }
          case interactiveTaskType.callContractMethod: {
            //@TODO check suffisient funds (remind fees temporally can be null)
            const contractAbi = tonLib.compileContractAbi(interactiveTask.params.abi);
            const message = await tonLib.encodeMessage(server, interactiveTask.params.address, contractAbi, interactiveTask.params.method, interactiveTask.params.input, wallet.keys);
            const shardBlockId = await tonLib.sendMessage(server, message.message, contractAbi);
            result = {message: message.message, shardBlockId};
            break;
          }
          case interactiveTaskType.transfer: {
            if (walletLib.isAddressesMatch(wallet.address, interactiveTask.params.walletAddress)) {
              const amountWithFee = BigInt('11000000') + BigInt(interactiveTask.params.amount);
              _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            }
            const message = await walletLib.createLegacyTransferMessage(
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
            if (interactiveTask.params.async === false) {
              result = await TonApi.waitForRunTransaction(server, result.message, result.processingState);
            }
            break;
          }
          case interactiveTaskType.trnsfr: {
            const walletContract = walletContractLib.getContractById(wallet.contractId);
            const abi = tonLib.compileContractAbi(walletContract.abi);
            if (walletLib.isAddressesMatch(wallet.address, interactiveTask.params.walletAddress)) {
              const amountWithFee = BigInt('11000000') + BigInt(interactiveTask.params.amount);
              _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            }
            const message = await walletLib.createTransferMessage(
              server,
              wallet,
              interactiveTask.params.walletAddress,
              interactiveTask.params.address,
              interactiveTask.params.amount,
              interactiveTask.params.bounce,
              interactiveTask.params.payload || ''
            );
            const shardBlockId = await tonLib.sendMessage(server, message, abi);
            result = {message, shardBlockId, abi};
            if (interactiveTask.params.async === false) {
              result = await tonLib.waitForTransaction(server, message, abi, shardBlockId)
            }
            break;
          }
          case interactiveTaskType.confirmTransaction: {
            const message = await walletLib.createLegacyConfirmTransactionMessage(
              server,
              wallet,
              interactiveTask.params.walletAddress,
              interactiveTask.params.txid,
            );
            const processingState = await TonApi.sendMessage(server, message);
            result = {processingState, message};
            break;
          }
          case interactiveTaskType.cnfrmTransaction: {
            const walletContract = walletContractLib.getContractById(wallet.contractId);
            const abi = tonLib.compileContractAbi(walletContract.abi);
            const message = await walletLib.createConfirmTransactionMessage(
              server,
              wallet,
              interactiveTask.params.walletAddress,
              interactiveTask.params.txid,
            );
            const shardBlockId = await tonLib.sendMessage(server, message, abi);
            result = {message: message, shardBlockId, abi};
            break;
          }
          case interactiveTaskType.sign: {
            result = await tonLib.sign(server, wallet.keys, interactiveTask.params.unsigned);
            break;
          }
          case interactiveTaskType.permitSite: {
            const trust = true === form.trust;
            await siteRepository.setPermissions(interactiveTask.data.siteId, true, trust);
            break;
          }
          default: {
            throw 'Unknown interactive type.';
          }
        }
        interactiveTask.statusId = interactiveTaskStatus.performed;
        interactiveTask.result = result;
        if (interactiveTask.data.callback !== undefined) {
          const frontPostApply = await interactiveTaskCallback.call(interactiveTask.data.callback);
          if (typeof frontPostApply !== 'undefined') {
            interactiveTask.data.frontPostApply = frontPostApply;
          }
        }
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
