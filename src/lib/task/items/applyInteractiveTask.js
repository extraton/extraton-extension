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
import {tokenContractException, tokenContractExceptionCodes} from "@/lib/token/TokenContractException";
import {tokenRepository} from "@/db/repository/tokenRepository";
import interactiveTaskCallback from "@/lib/task/interactive/callback";
import addToken from "@/lib/task/interactive/callback/addToken";
import UndecimalIsNotIntegerException from "@/lib/token/UndecimalIsNotIntegerException";
import tonLib from "@/api/tonSdk";

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
            if (interactiveTask.params.async === false) {
              result = await TonApi.waitForDeployTransaction(server, result.message, result.processingState);
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
            //@TODO validate address
            const {contract, boc} = await tokenContractLib.getContractByAddress(server, form.address);
            const tokenData = await contract.getTokenData(server, boc, form.address, wallet.keys.public);
            if (await tokenRepository.isTokenExists(interactiveTask.networkId, form.address, interactiveTask.params.walletId)) {
              throw new tokenContractException(tokenContractExceptionCodes.alreadyAdded.code);
            }
            const token = await tokenRepository.create(
              contract.id,
              interactiveTask.networkId,
              interactiveTask.params.walletId,
              form.address,
              tokenData.name,
              tokenData.symbol,
              tokenData.decimals,
              tokenData.walletAddress,
              tokenData.balance,
              tokenData.params,
            );
            interactiveTask.data.callback = {name: addToken.name, params: [token.id]};

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
