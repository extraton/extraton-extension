<template>
  <v-select v-model="select"
            @change="changeNetwork"
            :items="items"
            class="networkSelect"
            label="Network"
            hide-details
            filled
            dense
  >
    <template v-slot:item="{item}">
      <v-list-item dense>
        <v-list-item-icon>
          <coin-icon :ruby="item.isDev"/>
          <!--          <v-icon :color="item.isDev ? '#ce0015' : '#0488cb'">mdi-diamond-stone</v-icon>-->
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.text }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.info }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mt-2"></v-divider>
    </template>
  </v-select>
</template>

<script>
import {mapActions, mapState} from "vuex";
import CoinIcon from "@/components/CoinIcon";

export default {
  components: {CoinIcon},
  data: () => ({
    select: null,
    items: [],
  }),
  created() {
    console.log(this.networks);
    for (let i in this.networks) {
      let network = this.networks[i];
      this.items.push({text: network.server, info: network.info, value: network.id, isDev: network.isDev});
    }
    this.select = this.network;
  },
  computed: {
    ...mapState('wallet', [
      'networks',
      'network'
    ]),
  },
  methods: {
    ...mapActions('wallet', [
      'changeNetwork'
    ]),
  },
}
</script>

<style lang="scss">
.networkSelect {
  margin-right: 4px !important;
  max-width: 160px !important;
  border-radius: unset !important;

  .v-input__slot {
    min-height: unset !important;
  }

  .v-input__control:before {
    border: none !important;
  }

  .v-input__slot:before {
    border: none !important;
  }

  .v-input__slot:after {
    border-style: none !important;
  }
}
</style>
