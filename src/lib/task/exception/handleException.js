const handleExceptionCodes = {
  invalidSeed: {code: 10, text: 'Invalid seed.'},
  keystore: {code: 11, text: null},
  invalidKeystoreFile: {code: 12, text: 'Invalid keystore file.'},
  canceledByUser: {code: 1000, text: 'Canceled by user.'},
  networkChanged: {code: 1001, text: 'Network changed'},
  walletChanged: {code: 1002, text: 'Wallet changed'},
  accountNotExists: {code: 1005, text: 'Account does not exists in blockchain'},
  websiteForbidden: {code: 1008, text: 'Website forbidden in extension.'},
  prohibitedToRunWalletContract: {code: 1100, text: 'Running methods of user wallet contract is prohibited.'},
  callingContractMethodRestricted: {code: 1101, text: null},
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
    if (null === this.message) {
      return text;
    } else if (null === text) {
      return this.message;
    } else {
      return `${text}: ${this.message}`;
    }
  };
};

export {
  handleException,
  handleExceptionCodes,
}
