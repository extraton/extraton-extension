<template>
  <div class="address">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs"
               v-on="on"
               v-clipboard="address"
               @click="$snack.success({text: 'Copied'})"
               :disabled="!address"
               icon small
        >
          <v-icon color="primary" small>mdi-content-copy</v-icon>
        </v-btn>
      </template>
      <span>Copy address</span>
    </v-tooltip>

    <span class="text-overline">{{ addressView }}</span>

    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" :disabled="!availableInExplorer" :href="explorerLink" target="_blank" icon small>
          <v-icon color="primary" small>mdi-open-in-new</v-icon>
        </v-btn>
      </template>
      <span>Open in explorer</span>
    </v-tooltip>

  </div>
</template>

<script>
import walletLib from "@/lib/wallet";
import {mapGetters} from "vuex";

export default {
  props: {
    address: String,
    availableInExplorer: {type: Boolean, default: true},
  },
  computed: {
    addressView() {
      return walletLib.addressToView(this.address);
    },
    explorerLink() {
      return walletLib.compileExplorerLink(this.explorer, this.address);
    },
    ...mapGetters('wallet', [
      'explorer',
    ]),
  }
}
</script>

<style lang="scss">
.address {
  display: flex;
  justify-content: center;
  align-items: center;

  &__iconCopy {
    margin-right: 5px;
  }

  &__iconOpen {
    margin-left: 5px;
  }
}
</style>
