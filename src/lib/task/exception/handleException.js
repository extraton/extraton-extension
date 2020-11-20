const handleExceptionCodes = {
  invalidSeed: {code: 10, text: 'Invalid seed.'},
  canceledByUser: {code: 1000, text: 'Canceled by user.'},
  networkChanged: {code: 1001, text: 'Network changed'},
  prohibitedToRunWalletContract: {code: 1100, text: 'Running methods of user wallet contract is prohibited.'},
  tonClientError: {code: 1200, text: 'TON Client error'},
  syncTime: {code: 1201, text: 'Device time is not synced.'},
}

const getCode = (code) => {
  for (let i in handleExceptionCodes) {
    if (handleExceptionCodes[i].code === code) {
      return handleExceptionCodes[i];
    }
  }
  throw `Code #${code} not found.`;
}

const handleException = function (code, message = null) {
  this.code = code;
  this.message = message;
  this.getCode = function () {
    return this.code;
  };
  this.toString = function () {
    const text = getCode(code).text;
    return null === this.message
      ? text
      : `${text}: ${this.message}`;
  };
};

export {
  handleException,
  handleExceptionCodes,
}
