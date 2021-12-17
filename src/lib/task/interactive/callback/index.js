import permitSite from "./permitSite";

const callbacks = {
  permitSite
};

export default {
  call: async ({name, params}) => {
    if (undefined === callbacks[name]) {
      throw `Callback '${name}' not exists.`;
    }
    return await callbacks[name].handle(...params);
  },
}
