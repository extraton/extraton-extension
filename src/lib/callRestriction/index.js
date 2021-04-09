import AddressCallRestriction from "@/lib/callRestriction/item/AddressCallRestriction";
import tokenContractLib from "@/lib/token/contract";

export default{
  check(walletAddress, account, method) {
    let restrictions = [
      new AddressCallRestriction(walletAddress),
      ...tokenContractLib.getCallRestrictions(),
    ];
    for (const restriction of restrictions) {
      restriction.check(account, method);
    }
  }
};
