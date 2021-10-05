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
import tokenContractLib from "@/lib/token/contract";
import {tokenContractException} from "@/lib/token/TokenContractException";
import {tokenRepository} from "@/db/repository/tokenRepository";
import interactiveTaskCallback from "@/lib/task/interactive/callback";
import addTokenCallback from "@/lib/task/interactive/callback/addToken";
import UndecimalIsNotIntegerException from "@/lib/token/UndecimalIsNotIntegerException";
import tonLib from "@/api/tonSdk";
import addTokenByAddress from "@/lib/token/addTokenByAddress";
import compileTokenApiView from "@/lib/token/compileApiView";
import {siteRepository} from "../../../db/repository/siteRepository";

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
            const abi = tonLib.compileContractAbi(interactiveTask.params.abi);
            const amountWithFee = BigInt('11000000') + BigInt(interactiveTask.params.options.initAmount);
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            const initPubkey = interactiveTask.params.options.initPubkey !== undefined ? interactiveTask.params.options.initPubkey : null;
            const address = await tonLib.predictAddress(server, abi, interactiveTask.params.imageBase64, wallet.keys.public, 0, initParams, initPubkey);
            await walletLib.transfer(server, wallet, address, interactiveTask.params.options.initAmount);
            break;
          }
          case interactiveTaskType.deployContract: {
            const amountWithFee = BigInt('73000000');
            _.checkSufficientFunds(wallet, interactiveTask.networkId, amountWithFee);
            const initParams = interactiveTask.params.options.initParams !== undefined ? interactiveTask.params.options.initParams : {};
            const initPubkey = interactiveTask.params.options.initPubkey !== undefined ? interactiveTask.params.options.initPubkey : null;
            result = await walletLib.deployContract(server, wallet, interactiveTask.params.abi, interactiveTask.params.imageBase64, initParams, interactiveTask.params.constructorParams, initPubkey);
            if (interactiveTask.params.async === false) {
              result = await tonLib.waitForTransaction(server, result.message.message, result.shardBlockId);
            }
            break;
          }
          case interactiveTaskType.runTransaction: {
            const message = await TonApi.createRunMessage(server, interactiveTask.params.address, interactiveTask.params.abi, interactiveTask.params.method, interactiveTask.params.params, wallet.keys);
            const processingState = await TonApi.sendMessage(server, message);
            const txid = await TonApi.waitForRunTransaction(server, message, processingState);
            // if (interactiveTask.params.async === false) {
            // }
            result = {txid};
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
            if (interactiveTask.params.async === false) {
              result = await TonApi.waitForRunTransaction(server, result.message, result.processingState);
            }
            break;
          }
          case interactiveTaskType.addToken: {
            const token = await addTokenByAddress(network, wallet, interactiveTask.params.rootAddress);
            interactiveTask.data.callback = {name: addTokenCallback.name, params: [token.id]};
            const contract = tokenContractLib.getContractById(token.contractId);
            result = compileTokenApiView(contract, token);
            break;
          }
          case interactiveTaskType.uiAddToken: {
            //@TODO validate address
            const token = await addTokenByAddress(network, wallet, form.address);
            interactiveTask.data.callback = {name: addTokenCallback.name, params: [token.id]};
            break;
          }
          case interactiveTaskType.uiTransferToken: {
            const token = await tokenRepository.getToken(interactiveTask.params.tokenId);
            const contract = tokenContractLib.getContractById(token.contractId);
            const undecimalAmount = tokenContractLib.undecimal(token, form.amount);
            tokenContractLib.checkSufficientFunds(token, undecimalAmount);
            const {message, shardBlockId, abi} = await contract.transfer(server, wallet.keys, token, form.address, undecimalAmount);
            await tonLib.waitForTransaction(server, message, abi, shardBlockId);

            break;
          }
          case interactiveTaskType.transferToken: {
            const token = await tokenRepository.getToken(interactiveTask.data.tokenId);
            const contract = tokenContractLib.getContractById(token.contractId);
            tokenContractLib.checkSufficientFunds(token, interactiveTask.params.amount);
            result = await contract.transfer(server, wallet.keys, token, interactiveTask.params.address, interactiveTask.params.amount);
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
        } else if (e instanceof UndecimalIsNotIntegerException) {
          interactiveTask.error = e.error;
        } else if (e instanceof keystoreException) {
          interactiveTask.error = e.message;
        } else if (e instanceof tokenContractException) {
          interactiveTask.error = e.toString();
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
