import tokenContractLib from "@/lib/token/contract";
import {tokenRepository} from "@/db/repository/tokenRepository";
import {tokenContractException, tokenContractExceptionCodes} from "@/lib/token/TokenContractException";

export default async function(network, wallet, address) {
  const {contract, boc} = await tokenContractLib.getContractByAddress(network.server, address);
  const tokenData = await contract.getTokenData(network.server, boc, address, wallet.keys.public);
  if (await tokenRepository.isTokenExists(network.id, address, wallet.id)) {
    throw new tokenContractException(tokenContractExceptionCodes.alreadyAdded.code);
  }
  return tokenRepository.create(
    contract.id,
    network.id,
    wallet.id,
    address,
    tokenData.name,
    tokenData.symbol,
    tokenData.decimals,
    tokenData.walletAddress,
    tokenData.balance,
    tokenData.params,
  );
}
