<template>
  <div class="wallet">
    <action-dialog/>
    <balance/>
    <main-address/>
    <div class="wallet__actions">
      <get-tokens v-if="isDevNetwork"/>
      <buy-tokens v-else/>
      <div class="wallet__actions__spacer"></div>
      <send-tokens/>
    </div>
  </div>
</template>

<script>

import {mapActions, mapGetters} from "vuex";
import ActionDialog from "@/components/ActionDialog";
import Balance from "@/components/Balance";
import MainAddress from "@/components/MainAddress";
import GetTokens from "@/components/GetTokens";
import SendTokens from "@/components/SendTokens";
import BuyTokens from "@/components/BuyTokens";

export default {
  components: {ActionDialog, MainAddress, Balance, GetTokens, BuyTokens, SendTokens},
  data() {
    return {};
  },
  mounted() {
    if (!this.isLoggedIn) {
      this.goToStart();
    } else {
      this.startBalanceUpdating();
      this.startTaskUpdating();
    }
  },
  computed: {
    ...mapGetters('wallet', [
      'isDevNetwork',
      'isLoggedIn',
    ]),
  },
  methods: {
    ...mapActions('wallet', [
      'goToStart',
      'startBalanceUpdating',
    ]),
    ...mapActions('action', [
      'startTaskUpdating',
    ]),
  }
}
</script>

<style lang="scss">
.wallet {
  &__actions {
    margin-top: 30px;
    display: flex;
    justify-content: center;

    &__spacer {
      width: 15px;
    }
  }
}
</style>
