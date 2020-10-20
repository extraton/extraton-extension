export default function (code, data = {}) {
  this.code = code;
  this.data = data;
  this.getCode = function() {
    return this.code;
  };
  this.getData = function() {
    return this.data;
  };
  this.toString = function() {
    return 'Task handling error.';
  };
}