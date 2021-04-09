<template>
  <div class="transferTokenAction">
    <div class="text-center text-h6">{{ tokenName }}</div>
    <amount info="Balance" :value="balanceView" :symbol="tokenSymbol"/>
    <div style="margin-top:25px">
      <div class="text-body-1">To address:</div>
      <addr :address="address" class="transfer__address"/>
      <amount info="Amount" :value="amountView" :symbol="tokenSymbol"/>
    </div>
  </div>
</template>

<script>
import Amount from "@/components/amount";
import Addr from "@/components/addr";

export default {
  components: {Amount, Addr},
  props: {
    disabled: Boolean,
    form: Object,
    tokenName: String,
    tokenSymbol: String,
    balanceView: String,
    amountView: String,
    address: String
  },
  data: () => ({}),
  created() {
  },
  methods: {
    sync() {
      // this.$emit('formChange', {
      // });
    },
  }
}
</script>

<style lang="scss">
.transferTokenAction {
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
