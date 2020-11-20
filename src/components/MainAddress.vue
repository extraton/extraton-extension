<template>
  <div class="mainAddress text-center">
    <div class="mainAddress__title text-subtitle-2">Address:</div>
    <addr v-if="address" :address="address" :available-in-explorer="isAddressAvailableInExplorer"/>
    <v-skeleton-loader v-else type="text" width="180"/>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import Addr from "@/components/addr";

export default {
  components: {Addr},
  computed: {
    ...mapState('wallet', [
      'address',
    ]),
    ...mapGetters('wallet', [
      'isAddressAvailableInExplorer',
    ]),
  },
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
