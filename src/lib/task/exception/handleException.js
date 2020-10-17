export default function (code) {
  this.code = code;
  this.getCode = function() {
    return this.code;
  };
  this.toString = function() {
    return 'Task handling error.';
  };
}