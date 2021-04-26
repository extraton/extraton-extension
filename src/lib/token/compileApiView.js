export default function(contract, token) {
  return {
    type: token.contractId,
    name: token.name,
    symbol: token.symbol,
    balance: token.balance,
    decimals: token.decimals,
    rootAddress: token.rootAddress,
    isActive: token.walletAddress !== null,
    walletAddress: token.walletAddress,
    data: contract.compileApiDataView(token),
  };
}
