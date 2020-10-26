<template>
  <div class="preDeployTransferAction">
    <div>
      <div class="text-center preDeployTransferAction__icon">
        <v-icon>mdi-cash-multiple</v-icon>
      </div>
      <div class="text-body-1">Pre-deploy contract transfer.</div>
    </div>
    <amount info="Amount" :value="amountView"/>
  </div>
</template>

<script>
import amount from "@/components/amount";
import walletLib from "@/lib/wallet";

export default {
  components: {amount},
  props: {disabled: Boolean, amount: String},
  computed: {
    amountView() {
      return walletLib.convertFromNano(this.amount, 9)
    },
  },
}
</script>

<style lang="scss">
.preDeployTransferAction {
  //display: flex;
  //flex-direction: column;
  //justify-content: space-between;
  //height: 100%;
  //padding-bottom: 52px;

  &__icon {
    margin: 20px 0;

    i {
      font-size: 55px !important;
    }
  }
}
</style>