<template>
  <div class="confirmTransaction">
    <div class="text-center confirmTransaction__icon">
      <v-icon>mdi-eye-check</v-icon>
    </div>
    <div class="text-body-1">From address:</div>
    <addr :address="walletAddress" class="confirmTransaction__address"/>
    <div class="text-body-1">Txid:</div>
    <txid :txid="txid"/>
  </div>
</template>

<script>
import Addr from "@/components/addr";
import Txid from "@/components/txid";

export default {
  components: {Txid, Addr},
  props: {disabled: Boolean, txid: String, walletAddress: String},
}
</script>

<style lang="scss">
.confirmTransaction {
  &__address {
    margin: 5px 0;
  }

  &__icon {
    margin: 20px 0;

    i {
      font-size: 55px !important;
    }
  }
}
</style>
