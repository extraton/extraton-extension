import database from "@/db";
import TonApi from '@/api/ton';
import networkNotConfigured from "@/lib/task/exception/networkNotConfigured";

export default {
  name: 'runGet',
  handle: async function ({contract, method}) {
    const db = await database.getClient();
    const networkId = (await db.param.get('network')).value;
    if (contract.networks === undefined || contract.networks[networkId] === undefined) {
      throw new networkNotConfigured(networkId);
    }
    const server = (await db.network.get(networkId)).server;
    const address = contract.networks[networkId].address;
    // const q = await TonApi.runGet(server, address, method); @TODO empty output
    const result = await TonApi.run(server, address, method, contract.abi);
    return result.output;
  }
}