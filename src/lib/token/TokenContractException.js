const tokenContractExceptionCodes = {
  notExists: {code: 1, text: 'Account not exists.'},
  itIsNotToken: {code: 2, text: 'Account is not token.'},
  alreadyAdded: {code: 3, text: 'Token is already added.'},
  unknownType: {code: 4, text: 'Unknown token type.'},
}

const getCode = (code) => {
  for (let i in tokenContractExceptionCodes) {
    if (tokenContractExceptionCodes[i].code === code) {
      return tokenContractExceptionCodes[i];
    }
  }
  throw `Code #${code} not found.`;
}

const tokenContractException = function (code) {
  this.code = code;
  this.toString = function () {
    return getCode(this.code).text;
  };
};

export {
  tokenContractException,
  tokenContractExceptionCodes,
}
