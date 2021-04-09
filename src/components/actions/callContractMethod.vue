<template>
  <div class="callContractMethodAction">
    <div>
      <div class="text-center runAction__icon">
        <v-icon>mdi-message-arrow-right</v-icon>
      </div>
      <div class="text-body-1">Call method "<span class="font-weight-bold">{{method}}</span>" at contract address:</div>
    </div>
    <addr :address="address" style="margin-top:15px"/>
    <amount info="Estimated fee" :value="fees" style="margin-top:15px" approx/>
  </div>
</template>

<script>
import Amount from "@/components/amount";
import Addr from "@/components/addr";

export default {
  components: {Amount, Addr},
  props: {disabled: Boolean, fees: String, address: String, method: String},
}
</script>

<style lang="scss">
.callContractMethodAction {
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
