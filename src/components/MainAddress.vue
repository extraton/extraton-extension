<template>
  <div class="mainAddress text-center">
    <div class="mainAddress__title text-subtitle-2">{{ accountName }}:</div>
    <addr v-if="address" :address="address" :available-in-explorer="isAddressAvailableInExplorer"
          :copy-warning="copyWarning" @changeShowWarning="changeShowWarning"/>
    <v-skeleton-loader v-else type="text" width="180"/>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import Addr from "@/components/addr";

export default {
  components: {Addr},
  props: {pluralTokenName: String},
  computed: {
    ...mapGetters('wallet', [
      'address',
      'accountName',
      'isAddressAvailableInExplorer',
    ]),
    hideAddrCopyWarning: {
      get() {
        return this.$store.state.settings.hideAddrCopyWarning;
      },
      set(value) {
        this.$store.dispatch('settings/changeHideAddrCopyWarning', value);
      },
    },
    copyWarning() {
      return this.hideAddrCopyWarning
        ? null
        : `Use this address only for TON ${this.pluralTokenName}. Every TIP-3 token has its own address.`;
    },
  },
  methods: {
    changeShowWarning(value) {
      this.hideAddrCopyWarning = value;
    }
  }
}
</script>

<style lang="scss">
.mainAddress {
  height: 32px;

  &__title {
    line-height: 12px !important;
  }

  .v-skeleton-loader {
    margin: 10px auto 0;
  }
}
</style>
