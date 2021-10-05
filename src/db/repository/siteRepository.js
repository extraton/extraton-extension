import database from '@/db';

export const siteRepository = {
  async getAll() {
    const db = await database.getClient();
    return db.site.toArray();
  },
  async getById(id) {
    const db = await database.getClient();
    const sites = await db.site.where({id}).toArray();
    if (0 === sites.length) {
      throw `Site #${id} isn't found.`;
    }
    return  sites[0];
  },
  async findOneByHost(host, networkId, walletId) {
    const db = await database.getClient();
    const sites = await db.site.where('[host+networkId+walletId]').equals([host, networkId, walletId]).toArray();
    return 0 !== sites.length ? sites[0] : null;
  },
  async getOrCreateIgnore(host, networkId, walletId) {
    const db = await database.getClient();
    let isCreated = false;
    let site = await this.findOneByHost(host, networkId, walletId);
    if (null === site) {
      const isPermitted = null;
      const isTrusted = false;
      site = {host, networkId, walletId, isPermitted, isTrusted};
      try {
        site.id = await db.site.add(site);
        isCreated = true;
      } catch (e) {
        site = await this.findOneByHost(host, networkId, walletId);
        if (null === site) {
          throw e;
        }
      }
    }
    return {isCreated, site};
  },
  async setPermissions(id, isPermitted, isTrusted) {
    const db = await database.getClient();
    await db.site.where('id').equals(id).modify({isPermitted, isTrusted});
  },
  async remove(id) {
    const db = await database.getClient();
    await db.site.where('id').equals(id).delete();
  },
  async clear() {
    const db = await database.getClient();
    await db.site.clear();
  },
};
