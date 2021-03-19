import tonLib from "@/api/tonSdk";
import {tokenContractException, tokenContractExceptionCodes} from "@/lib/token/TokenContractException";
import tip3 from '@/lib/token/tip3';

const _ = {
  findTokenContractByCodeHash: (codeHash) => {
    for (const contract of tip3) {
      if (contract.codeHash === codeHash) {
        return contract;
      }
    }

    return null;
  },
  findTokenContractByContractId: (contractId) => {
    for (const contract of tip3) {
      if (contract.id === contractId) {
        return contract;
      }
    }

    return null;
  },
};

export default {
  getContractByAddress: async (server, address) => {
    const account = await tonLib.requestAccountData(server, address);
    if (null === account) {
      throw new tokenContractException(tokenContractExceptionCodes.notExists.code);
    }
    const contract = _.findTokenContractByCodeHash(account.code_hash);
    if (null === contract) {
      throw new tokenContractException(tokenContractExceptionCodes.itIsNotToken.code);
    }

    return {contract, boc: account.boc};
  },
  getContractById: (contractId) => {
    const contract = _.findTokenContractByContractId(contractId);
    if (null === contract) {
      throw new tokenContractException(tokenContractExceptionCodes.unknownType.code);
    }

    return contract;
  },
}
