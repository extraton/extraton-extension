<template>
  <div class="balance">
    <coin-icon :ruby="isDevNetwork" left/>
    <span v-if="null !== balanceView" class="text-h4">{{ balanceView }}</span>
    <v-skeleton-loader v-else type="heading" width="86"/>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import CoinIcon from "@/components/CoinIcon";
import walletLib from "@/lib/wallet";

export default {
  components: {CoinIcon},
  props: {},
  data() {
    return {walletLib};
  },
  computed: {
    ...mapGetters('wallet', [
      'balanceView',
      'isDevNetwork',
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
