<template>
  <div class="mainAddress text-center">
    <div class="mainAddress__title text-subtitle-2">Address:</div>
    <div v-if="addressView" class="mainAddress__body">
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
          <v-btn v-bind="attrs" v-on="on" :disabled="!isAddressAvailableInExplorer" :href="explorerLink" target="_blank" icon small>
            <v-icon color="primary" small>mdi-open-in-new</v-icon>
          </v-btn>
        </template>
        <span>Open in explorer</span>
      </v-tooltip>

    </div>
    <v-skeleton-loader v-else type="text" width="180"/>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  computed: {
    ...mapState('wallet', [
      'address',
    ]),
    ...mapGetters('wallet', [
      'addressView',
      'explorerLink',
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

  &__body {
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

  .v-skeleton-loader {
    margin: 10px auto 0;
  }
}
</style>
