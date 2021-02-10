<template>
  <div class="wallet">
    <action-dialog/>
    <password-dialog/>
    <edit-wallet-dialog/>
    <balance/>
    <div>
      <main-address/>
      <is-it-your-address @yes="thatsMyAddress" v-if="isItYourAddressShowing"/>
    </div>
    <div class="wallet__actions">
      <template v-if="isDevNetwork">
        <get-tokens/>
        <div class="wallet__actions__spacer"/>
      </template>
      <send-tokens/>
    </div>
    <v-card class="mx-auto" :elevation="2" style="margin-top:5px">
      <v-img src="@/assets/support-us.png" class="ma-auto" width="100px" height="100px"/>
      <v-card-subtitle class="text-center font-weight-bold">
        Please, support our proposal<br/>on the forum.
      </v-card-subtitle>
      <v-card-actions style="padding-top:0">
        <v-btn color="primary" class="ma-auto"
               href="https://forum.freeton.org/t/proposal-extraton-partnership/8371?u=qwertys318" target="_blank" small>
          Support
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>

import {mapActions, mapGetters} from "vuex";
import ActionDialog from "@/components/ActionDialog";
import PasswordDialog from "@/components/PasswordDialog";
import Balance from "@/components/Balance";
import MainAddress from "@/components/MainAddress";
import IsItYourAddress from "@/components/IsItYourAddress";
import GetTokens from "@/components/GetTokens";
import SendTokens from "@/components/SendTokens";
import EditWalletDialog from "@/components/EditWalletDialog";

export default {
  components: {
    EditWalletDialog,
    ActionDialog,
    PasswordDialog,
    MainAddress,
    IsItYourAddress,
    Balance,
    GetTokens,
    SendTokens
  },
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
      'isItYourAddressShowing',
    ]),
  },
  methods: {
    ...mapActions('wallet', [
      'goToStart',
      'startBalanceUpdating',
      'thatsMyAddress',
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
