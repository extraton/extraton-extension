import addToken from "@/lib/task/interactive/frontPostApply/addToken";
import createNewEmptyTokenWallet from "@/lib/task/interactive/frontPostApply/createNewEmptyTokenWallet";

const postApplies = {
  addToken,
  createNewEmptyTokenWallet,
};

export default {
   call: async ({name, params}) => {
    if (undefined === postApplies[name]) {
      throw `Post apply '${name}' not exists.`;
    }
    await postApplies[name].handle(...params);
  },
}
