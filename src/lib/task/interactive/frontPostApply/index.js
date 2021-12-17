import permitSite from "./permitSite";

const postApplies = {
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
