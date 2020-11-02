const tonExceptionCodes = {
  syncTime: 1013,
}

const tonException = function (code, message) {
  this.code = code;
  this.message = message;
  this.getCode = function () {
    return this.code;
  };
  this.toString = function () {
    return this.message;
  };
};

export {
  tonExceptionCodes,
  tonException,
}