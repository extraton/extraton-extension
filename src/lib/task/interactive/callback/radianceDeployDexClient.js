import {tokenRepository} from "@/db/repository/tokenRepository";
import {networkRepository} from "@/db/repository/networkRepository";
import tip3RadianceLib from "@/lib/token/tip3/radiance";

export default {
  name: 'radianceDeployDexClient',
  handle: async function (tokenId, networkId, interactiveTaskRequestId, dexClientAddress) {
    const token = await tokenRepository.getToken(tokenId);
    const network = await networkRepository.getById(networkId);
    await tip3RadianceLib.addCreateNewEmptyWalletTask(token, network, interactiveTaskRequestId, dexClientAddress);
  }
}
