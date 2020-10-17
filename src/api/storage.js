import extensionizer from 'extensionizer'

const isStorageAvailable = null !== extensionizer.storage;

const findError = () => {
  const {lastError} = extensionizer.runtime
  if (!lastError) {
    return null;
  }
  if (lastError.stack && lastError.message) {
    return lastError;
  }
  return new Error(lastError.message);
};

export default {
  async set(key, value) {
    if (isStorageAvailable) {
      const {local} = extensionizer.storage;
      let obj = {};
      obj[key] = value;
      await local.set(obj);
    }
  },
  async get(key) {
    if (!isStorageAvailable) {
      return null;
    }
    const {local} = extensionizer.storage;
    const data = await local.get(null);
    const err = findError();
    if (null !== err) {
      throw new Error(err);
    }
    return undefined !== data[key] ? data[key] : null;
  },
  remove(key) {
    if (isStorageAvailable) {
      const {local} = extensionizer.storage;
      local.remove(key);
    }
  }
}
