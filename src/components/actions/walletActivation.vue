<template>
  <div class="walletActivationAction">
    <div>
      <div class="text-center walletActivationAction__icon">
        <v-icon>mdi-wallet-plus</v-icon>
      </div>
      <div class="text-body-1">Before perform any transactions you need to deploy wallet contract to your address.</div>
    </div>
    <amount info="Estimated fee" value="0.073"/>
  </div>
</template>

<script>
import amount from "@/components/amount";

export default {
  components: {amount},
  props: {disabled: Boolean},
}
</script>

<style lang="scss">
.walletActivationAction {
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