<template>
  <v-app class="app">
    <snack/>
    <v-alert v-if="restored" type="success" class="ma-auto">
      Wallet successfully restored! Now you can open extension to use it!
    </v-alert>
    <v-card v-else class="ma-auto" width="100%" max-width="600">
      <v-card-title>
        Keystore Tools
        <sup class="red--text">beta</sup>
      </v-card-title>
      <v-tabs v-model="tab" grow icons-and-text>
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#restore">
          Restore Wallet
          <v-icon>mdi-wallet</v-icon>
        </v-tab>
        <v-tab href="#encrypt">
          Encrypt Key
          <v-icon>mdi-lock</v-icon>
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item value="restore">
          <restore-by-keystore-tab @restored="restored=true" :created="created"/>
        </v-tab-item>
        <v-tab-item value="encrypt">
          <encrypt-key-tab @created="onCreated"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-app>
</template>

<script>
import Snack from "@/components/Snack";
import EncryptKeyTab from "@/components/EncryptKeyTab";
import RestoreByKeystoreTab from "@/components/RestoreByKeystoreTab";

export default {
  components: {RestoreByKeystoreTab, EncryptKeyTab, Snack},
  data() {
    return {
      tab: null,
      created: false,
      restored: false,
    }
  },
  methods: {
    onCreated() {
      this.created = true;
      this.tab = 'restore';
    },
  }
};
</script>

<style lang="scss">
html {
  overflow: hidden;
}

.app {

}
</style>
