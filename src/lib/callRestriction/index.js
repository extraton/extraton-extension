import AddressCallRestriction from "@/lib/callRestriction/item/AddressCallRestriction";

export default{
  check(walletAddress, account, method) {
    let restrictions = [
      new AddressCallRestriction(walletAddress),
    ];
    for (const restriction of restrictions) {
      restriction.check(account, method);
    }
  }
};
