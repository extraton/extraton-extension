const SafeMultisigWallet = require('@/contracts/SafeMultisigWallet.json');
const SetcodeMultisig = require('@/contracts/SetcodeMultisigWallet.json');
const SetcodeMultisig2 = require('@/contracts/SetcodeMultisigWallet2.json');

const _ = {
  contracts: [
    {id: 1, name: 'Safe Multisig (Recommend)', info: 'Formal verified wallet contract', contract: SafeMultisigWallet},
    {id: 2, name: 'Set Code Multisig', info: 'Old surf', contract: SetcodeMultisig},
    {id: 3, name: 'Set Code Multisig 2', info: 'Current surf', contract: SetcodeMultisig2},
  ],
};
export default {
  ids: {safeMultisig: 1, setcodeMultisig: 2, setcodeMultisig2: 3},
  compileSelectData: () => {
    let data = [];
    for (const contract of _.contracts) {
      data.push({value: contract.id, text: contract.name, info: contract.info});
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