<template>
  <v-list class="assets" two-line>
    <v-subheader>ASSETS</v-subheader>
    <v-list-item-group color="primary">
      <v-divider/>
      <div v-for="(token, index) in tokensByNetwork" :key="index">
        <v-list-item :to="{name:routes.walletToken, params:{id:token.id}}">
          <v-list-item-icon>
            <v-icon>$vuetify.icons.coins</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ BN(token.balance).toFormat(0) }} {{ token.symbol }}</v-list-item-title>
            <v-list-item-subtitle>{{ token.name }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-icon class="assets__item_chevron">
            <v-icon>mdi-chevron-right</v-icon>
          </v-list-item-icon>
        </v-list-item>
        <v-divider/>
      </div>
    </v-list-item-group>
    <v-list-item>
      <v-list-item-content>
        <div class="text-center">
          <v-btn @click="initAddToken" color="primary" small outlined>Add token</v-btn>
        </div>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import {routes} from "@/plugins/router";
import {mapActions, mapGetters} from "vuex";
import BN from "bignumber.js";

export default {
  data: () => ({
    routes,
    BN,
  }),
  computed: {
    ...mapGetters('token', [
      'tokensByNetwork'
    ]),
  },
  methods: {
    ...mapActions('token', [
      'initAddToken'
    ]),
  },
}
</script>

<style lang="scss">
.assets {
  margin-top: 5px;

  .v-subheader {
    height: 30px;
  }

  .assets__item_chevron {
    margin: 24px 0 0 0 !important;
  }
}
</style>
