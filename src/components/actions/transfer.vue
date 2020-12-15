<template>
  <div class="transfer">
    <div class="text-center transfer__icon">
      <v-icon>mdi-cash-multiple</v-icon>
    </div>
    <template v-if="!isCurrentAddress">
      <div class="text-body-1">From address:</div>
      <addr :address="walletAddress" class="transfer__address"/>
    </template>
    <div class="text-body-1">To address:</div>
    <addr :address="address" class="transfer__address"/>
    <amount info="Amount" :value="amountView"/>
    <amount info="Estimated fee" value="0.011" approx/>
  </div>
</template>

<script>
import amount from "@/components/amount";
import walletLib from "@/lib/wallet";
import Addr from "@/components/addr";

export default {
  components: {Addr, amount},
  props: {disabled: Boolean, amount: String, address: String, walletAddress: String, isCurrentAddress: Boolean},
  computed: {
    amountView() {
      return walletLib.convertFromNano(this.amount, 9)
    },
  },
}
</script>

<style lang="scss">
.transfer {
  &__address {
    margin: 3px 0;
  }

  &__icon {
    margin: 0 0 10px 0;

    i {
      font-size: 55px !important;
    }
  }
}
</style>
