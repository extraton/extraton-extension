import {networkRepository} from "@/db/repository/networkRepository";
import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'getNetwork',
  isLoginRequired: true,
  handle: async function () {
    const networkId = await paramRepository.get('network');
    const network = await networkRepository.getById(networkId);
    return {id: network.id, server: network.server, explorer: network.explorer};
  }
}
