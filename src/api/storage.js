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
  set(key, value) {
    if (isStorageAvailable) {
      const {local} = extensionizer.storage;
      let obj = {};
      obj[key] = value;
      local.set(obj);
    }
  },
  async get(key) {
    return new Promise((resolve, reject) => {
      if (!isStorageAvailable) {
        resolve(null);
      }
      const {local} = extensionizer.storage;
      local.get(null, (result) => {
        const err = findError();
        if (null === err) {
          const value = undefined !== result[key] ? result[key] : null;
          resolve(value);
        } else {
          reject(err);
        }
      })
    })
  },
  remove(key) {
    if (isStorageAvailable) {
      const {local} = extensionizer.storage;
      local.remove(key);
    }
  }
}
