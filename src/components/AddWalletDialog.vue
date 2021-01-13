<template>
  <v-dialog v-model="isDialogShowing" content-class="addWalletDialog">
    <template v-slot:activator="{}">
      <v-tooltip left>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn v-on="{...tooltip}" @click="open" large icon>
            <v-icon large>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>Add Wallet</span>
      </v-tooltip>
    </template>
    <v-card class="addWalletDialog__card">
      <v-card-title style="padding:5px">
        <v-spacer></v-spacer>
        <v-btn @click="isDialogShowing=false" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <create-or-restore @choose="isDialogShowing=false" :route-create="routes.walletAdd"
                         :route-restore="routes.walletAddRestore"/>
    </v-card>
  </v-dialog>
</template>

<script>
import CreateOrRestore from "@/components/CreateOrRestore";
import {routes} from '@/plugins/router'

export default {
  components: {CreateOrRestore},
  data: () => ({
    isDialogShowing: false,
    routes,
  }),
  methods: {
    open() {
      this.$emit('open');
      this.isDialogShowing = true;
    },
  }
}
</script>

<style lang="scss">
.addWalletDialog {
}
</style>
