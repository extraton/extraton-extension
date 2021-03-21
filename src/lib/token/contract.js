import tonLib from "@/api/tonSdk";
import {tokenContractException, tokenContractExceptionCodes} from "@/lib/token/TokenContractException";
import tip3 from '@/lib/token/tip3';
import BN from "bignumber.js";
import UndecimalIsNotIntegerException from "@/lib/token/UndecimalIsNotIntegerException";
import insufficientFundsException from "@/lib/task/exception/insufficientFundsException";

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
  undecimal: (token, amount) => {
    const decimals =  BN(token.decimals);
    const multiplyBy = BN('10').exponentiatedBy(decimals);
    const undecimalAmount = BN(amount).multipliedBy(multiplyBy);
    if (!undecimalAmount.isInteger()) {
      throw new UndecimalIsNotIntegerException();
    }

    return undecimalAmount.toString();
  },
  checkSufficientFunds: (token, amount) => {
    if (BN(token.balance).isLessThan(BN(amount))) {
      throw new insufficientFundsException();
    }
  },
}
