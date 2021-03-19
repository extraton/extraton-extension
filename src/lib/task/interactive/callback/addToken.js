import {tokenRepository} from "@/db/repository/tokenRepository";
import addToken from "@/lib/task/interactive/frontPostApply/addToken";

export default {
  name: 'addToken',
  handle: async function (tokenId) {
    const tokens = await tokenRepository.getAll();
    const frontPostApply = {name: addToken.name, params: [tokens, tokenId]};

    return frontPostApply;
  }
}
