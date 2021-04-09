export default class CheckCallRestrictionException {
  constructor(text) {
    this.text = text;
    this.toString = function () {
      return this.text;
    };
  }
}
