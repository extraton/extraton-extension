import CheckCallRestrictionException from "@/lib/callRestriction/CheckCallRestrictionException";
const sprintf = require('sprintf-js').sprintf;

export default class CodeHashCallRestriction {
  constructor(codeHash, allowedMethods = []) {
    this.codeHash = codeHash;
    this.allowedMethods = allowedMethods;
  }

  check(account, method) {
    const contractCodeHashLowerCase = account.code_hash.toLowerCase();
    if (contractCodeHashLowerCase === this.codeHash.toLowerCase()) {
      if (0 === this.allowedMethods.length) {
        throw new CheckCallRestrictionException(sprintf(
          "Calling methods in contract with hash code '%s' is restricted.",
          contractCodeHashLowerCase,
        ));
      } else {
        let isMethodAllowed = false;
        for (const allowedMethod of this.allowedMethods) {
          if (method === allowedMethod) {
            isMethodAllowed = true;
            break;
          }
        }
        if (!isMethodAllowed) {
          throw new CheckCallRestrictionException(sprintf(
            "Calling method '%s' in contract with hash code '%s' is restricted.",
            contractCodeHashLowerCase,
            method,
          ));
        }
      }
    }
  }
}
