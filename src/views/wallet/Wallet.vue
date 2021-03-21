<template>
  <div class="wallet">
    <balance class="wallet__balance"/>
    <div>
      <main-address :plural-token-name="isDevNetwork?'Rubies':'Crystals'"/>
      <is-it-your-address @yes="thatsMyAddress" v-if="isItYourAddressShowing"/>
    </div>
    <div class="wallet__actions">
      <template v-if="isDevNetwork">
        <get-tokens/>
        <div class="wallet__actions__spacer"/>
      </template>
      <send-ton/>
    </div>
    <assets v-if="tip3"/>
  </div>
</template>

<script>

import {mapActions, mapGetters, mapState} from "vuex";
import Balance from "@/components/Balance";
import MainAddress from "@/components/MainAddress";
import IsItYourAddress from "@/components/IsItYourAddress";
import GetTokens from "@/components/GetTokens";
import SendTon from "@/components/SendTon";
import Assets from "@/components/assets/Assets";

export default {
  components: {
    Assets,
    MainAddress,
    IsItYourAddress,
    Balance,
    GetTokens,
    SendTon
  },
  data() {
    return {};
  },
  mounted() {
    if (!this.isLoggedIn) {
      this.goToStart();
    } else {
      this.startBalanceUpdating();
    }
  },
  computed: {
    ...mapGetters('wallet', [
      'isDevNetwork',
      'isLoggedIn',
      'isItYourAddressShowing',
    ]),
    ...mapState('settings', [
      'tip3',
    ]),
  },
  methods: {
    ...mapActions('wallet', [
      'goToStart',
      'startBalanceUpdating',
      'thatsMyAddress',
    ]),
  }
}
</script>

<style lang="scss">
.wallet {
  &__balance {
    margin: 30px 0;
  }
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
