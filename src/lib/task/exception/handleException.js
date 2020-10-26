const handleExceptionCodes = {
  invalidSeed: {code: 10, text: 'Invalid seed.'},
  canceledByUser: {code: 1000, text: 'Canceled by user.'},
}

const getCode = (code) => {
  for (let i in handleExceptionCodes) {
    if (handleExceptionCodes[i].code === code) {
      return handleExceptionCodes[i];
    }
  }
  throw `Code #${code} not found.`;
}

const handleException = function (code, data = {}) {
  this.code = code;
  this.data = data;
  this.getCode = function () {
    return this.code;
  };
  this.getData = function () {
    return this.data;
  };
  this.toString = function () {
    return getCode(code).text;
  };
};

export {
  handleException,
  handleExceptionCodes,
}