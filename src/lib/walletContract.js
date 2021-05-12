const SafeMultisigWallet = require('@/contracts/SafeMultisigWallet.json');
const SetcodeMultisig = require('@/contracts/SetcodeMultisigWallet.json');
const SetcodeMultisig2 = require('@/contracts/SetcodeMultisigWallet2.json');

const _ = {
  contracts: [
    {id: 1, contract: SafeMultisigWallet},
    {id: 2, contract: SetcodeMultisig},
    {id: 3, contract: SetcodeMultisig2},
  ],
};
export default {
  ids: {safeMultisig: 1, setcodeMultisig: 2, setcodeMultisig2: 3},
  compileSelectData: (i18n) => {
    let data = [];
    for (const contract of _.contracts) {
      data.push({
        value: contract.id,
        text: i18n.t(`contracts.${contract.id}.name`),
        info: i18n.t(`contracts.${contract.id}.info`)
      });
    }
    return data;
  },
  getContractById: (id) => {
    for (const contract of _.contracts) {
      if (contract.id === id) {
        return contract.contract;
      }
    }
    throw `Contract #${id} is not found`;
  }
}
