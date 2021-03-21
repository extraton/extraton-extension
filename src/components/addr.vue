<template>
  <div class="address">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-dialog v-if="null!==copyWarning" v-model="copyWarningDialog">
          <template v-slot:activator="{}">
            <v-btn v-bind="attrs"
                   v-on="on"
                   @click="copyWarningDialog=true"
                   :disabled="!address"
                   icon small
            >
              <v-icon color="primary" small>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>Warning!</v-card-title>
            <v-card-text class="font-weight-bold">{{ copyWarning }}</v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn
                v-clipboard="address"
                @success="onCopied"
                @error="$snack.danger({text: 'Copy Error'})"
                color="primary"
                small
              >Got it</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-btn v-else
               v-bind="attrs"
               v-on="on"
               v-clipboard="address"
               @success="onCopied"
               @error="$snack.danger({text: 'Copy Error'})"
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
        <v-btn v-bind="attrs" v-on="on" :disabled="!availableInExplorer" :href="explorerLink" target="_blank" icon
               small>
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
    copyWarning: {type: String, default: null},
  },
  data() {
    return {
      copyWarningDialog: false,
    };
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
  },
  methods: {
    onCopied() {
      this.copyWarningDialog = false;
      this.$snack.success({text: 'Copied'});
    }
  },
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
