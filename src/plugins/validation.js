let i18n;
import BN from "bignumber.js";

export default {
  setI18n(item){
    i18n = item;
  },
  install(Vue) {
    Vue.prototype.$validation = {
      required(value) {
        return !!value || i18n.t('validation.required');
      },
      wordsNum(value) {
        const r = value.match(/[^\s-.]+/g);
        const matchSeed = null !== r ? r : [];
        return matchSeed.length !== 12 && matchSeed.length !== 24
          ? i18n.t('validation.wordsNum')
          : true;
      },
      gte(n) {
        return value => BN(value).isGreaterThanOrEqualTo(BN(n)) || i18n.t('validation.gte', [n]);
      },
      gt(n) {
        return value => BN(value).isGreaterThan(BN(n)) || i18n.t('validation.gt', [n]);
      },
      transferCommentLength(value) {
        return value.length < 121 || i18n.t('validation.tooLong');
      },
    }
  }
};
