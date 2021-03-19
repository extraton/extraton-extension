<template>
  <div class="balance">
    <template v-if="null===tokenId">
      <coin-icon :ruby="isDevNetwork" left/>
      <span v-if="null !== balanceView" class="text-h4">{{ balanceView }}</span>
      <v-skeleton-loader v-else type="heading" width="86"/>
    </template>
    <template v-else>
      <span v-if="null!==tokenId" class="balance__symbol text-overline">{{ token(tokenId).symbol }}</span>
      <span class="text-h4">
        {{ BN(token(tokenId).balance).toFormat(0) }}
      </span>
    </template>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import CoinIcon from "@/components/CoinIcon";
import walletLib from "@/lib/wallet";
import BN from "bignumber.js";

export default {
  components: {CoinIcon},
  props: {
    tokenId: {type: Number, default: null},
  },
  data() {
    return {walletLib, BN};
  },
  computed: {
    ...mapGetters('wallet', [
      'balanceView',
      'isDevNetwork',
    ]),
    ...mapGetters('token', [
      'token'
    ]),
  },
}
</script>

<style lang="scss">
.balance {
  display: flex;
  justify-content: center;
  height: 40px;
  align-items: center;

  &__symbol {
    margin-right: 3px;
  }

  i {
    padding-right: 5px;
  }

  .v-skeleton-loader__heading {
    width: 100%;
  }
}
</style>
