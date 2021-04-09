import CheckCallRestrictionException from "@/lib/callRestriction/CheckCallRestrictionException";
const sprintf = require('sprintf-js').sprintf;

export default class AddressCallRestriction {
  constructor(address) {
    this.address = address;
  }

  check(account/*, method*/) {
    const contractAddressLowerCase = account.id.toLowerCase();
    if (contractAddressLowerCase === this.address.toLowerCase()) {
      throw new CheckCallRestrictionException(sprintf(
        "Calling methods in contract with address '%s' is restricted.",
        contractAddressLowerCase,
      ));
    }
  }
}
