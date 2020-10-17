export default {
  throwErrorIfOccurred: function() {
    const error = this._findError();
    if (null !== error) {
      throw error;
    }
  },
  _findError: function () {
    const {lastError} = chrome.runtime;
    if (!lastError) {
      return null;
    }
    if (lastError.stack && lastError.message) {
      return lastError;
    }
    return new Error(lastError.message);
  },
};