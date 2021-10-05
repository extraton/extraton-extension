const handleExceptionCodes = {
  invalidSeed: {code: 10, text: 'Invalid seed.'},
  keystore: {code: 11, text: null},
  invalidKeystoreFile: {code: 12, text: 'Invalid keystore file.'},
  tokenAlreadyActive: {code: 13, text: 'Token already active.'},
  canceledByUser: {code: 1000, text: 'Canceled by user.'},
  networkChanged: {code: 1001, text: 'Network changed'},
  walletChanged: {code: 1002, text: 'Wallet changed'},
  tokenNotFound: {code: 1003, text: 'Token wallet not found'},
  tokenNotActive: {code: 1004, text: 'Token wallet is not active'},
  accountNotExists: {code: 1005, text: 'Account does not exists in blockchain'},
  tokenNotFoundOrNotSupporting: {code: 1006, text: 'Token by this address isn\'t found or not supporting.'},
  tokenAlreadyAdded: {code: 1007, text: 'Token already added.'},
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
