import addToken from "@/lib/task/interactive/callback/addToken";
import createNewEmptyTokenWallet from "@/lib/task/interactive/callback/createNewEmptyTokenWallet";
import radianceDeployDexClient from "@/lib/task/interactive/callback/radianceDeployDexClient";

const callbacks = {
  addToken,
  createNewEmptyTokenWallet,
  radianceDeployDexClient,
};

export default {
  call: async ({name, params}) => {
    if (undefined === callbacks[name]) {
      throw `Callback '${name}' not exists.`;
    }
    return await callbacks[name].handle(...params);
  },
}
