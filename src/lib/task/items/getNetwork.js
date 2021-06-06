import database from "@/db";
import {networkRepository} from "@/db/repository/networkRepository";

export default {
  name: 'getNetwork',
  isLoginRequired: true,
  handle: async function () {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    const network = await networkRepository.getById(networkId);
    return {id: network.id, server: network.server, explorer: network.explorer};
  }
}
