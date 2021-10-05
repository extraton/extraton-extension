import addToken from "@/lib/task/interactive/frontPostApply/addToken";
import createNewEmptyTokenWallet from "@/lib/task/interactive/frontPostApply/createNewEmptyTokenWallet";
import permitSite from "./permitSite";

const postApplies = {
  addToken,
  createNewEmptyTokenWallet,
  permitSite
};

export default {
   call: async ({name, params}) => {
    if (undefined === postApplies[name]) {
      throw `Post apply '${name}' not exists.`;
    }
    await postApplies[name].handle(...params);
  },
}
