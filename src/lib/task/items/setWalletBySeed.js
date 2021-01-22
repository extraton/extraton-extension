import TonApi from '@/api/ton';
import database from '@/db';
import {handleException, handleExceptionCodes} from '@/lib/task/exception/handleException';
import walletContractLib from '@/lib/walletContract';
import {walletRepository} from '@/db/repository/walletRepository';

export default {
  name: 'setWalletBySeed',
  errorCodes: {
    invalidSeed: 10,
  },
  handle: async function (task) {
    const {seed, contractId, isRestoring} = task.data;
    const db = await database.getClient();
    const server = (await db.network.get(1)).server;
    let keys = null;
    try {
      keys = await TonApi.convertSeedToKeys(server, seed);
    } catch (err) {
      if (err.code === 2017) {
        throw new handleException(handleExceptionCodes.invalidSeed.code);
      } else {
        throw err;
      }
    }
    const contract = walletContractLib.getContractById(contractId);
    const address = await TonApi.predictAddress(server, keys.public, contract.abi, contract.imageBase64);

    const wallet = await walletRepository.create(contractId, address, keys, isRestoring);
    wallet.name = wallet.id === 1 ? 'Main Wallet' : `Wallet ${wallet.id}`;
    await walletRepository.updateName(wallet);

    await db.param.update('wallet', {value: wallet.id});
  }
}
