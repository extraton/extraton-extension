import database from '@/db';

const _ = {
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}

export default {
  async isLoggedIn() {
    const db = await database.getClient();
    return (await db.param.get('address')).value !== null;
  },
  //@TODO infinity
  async waitLoggedIn() {
    if (await this.isLoggedIn()) {
      return;
    }
    await _.timeout(500);
    return await this.waitLoggedIn();
  },
  async isContractDeployed(networkId) {
    const db = await database.getClient();
    return (await db.network.get(networkId)).account.codeHash !== null;
  }
};