import database from '@/db';

const tokenRepository = {
  async isTokenExists(networkId, rootAddress, walletId) {
    const db = await database.getClient();
    const tokens = await db.token.where({networkId, rootAddress, walletId}).toArray();
    return tokens.length > 0;
  },
  async create(contractId, networkId, walletId, rootAddress, name, symbol, decimals, walletAddress, balance, params) {
    const db = await database.getClient();
    let token = {
      contractId,
      networkId,
      walletId,
      rootAddress,
      name,
      symbol,
      decimals,
      walletAddress,
      balance,
      params,
    };
    // console.log({token});
    token.id = await db.token.add(token);

    return token;
  },
  async getAll() {
    const db = await database.getClient();
    // db.token.clear();
    return db.token.toArray();
  },
  async getByWalletAndNetwork(walletId, networkId) {
    const db = await database.getClient();
    return await db.token.where({walletId, networkId}).toArray();
  },
  async findOneByWalletAndNetworkAndRootAddress(walletId, networkId, rootAddress) {
    const db = await database.getClient();
    return (await db.token.where({walletId, networkId, rootAddress}).toArray())[0] || null;
  },
  async delete(id) {
    const db = await database.getClient();
    await db.token.where('id').equals(id).delete();
  },
  async getToken(tokenId) {
    const db = await database.getClient();
    return await db.token.get(tokenId);
  },
  async updateWalletAddress(token) {
    const db = await database.getClient();
    await db.token.update(token.id, {walletAddress: token.walletAddress});
  },
  async updateBalance(token) {
    const db = await database.getClient();
    await db.token.update(token.id, {balance: token.balance});
  },
  async setIsDeploying(token) {
    const db = await database.getClient();
    await db.token.update(token.id, {isDeploying: token.isDeploying});
  }
};

export {
  tokenRepository,
};
