<template>
  <v-container class="sitesView">
    <div class="headline">Site permissions</div>
    <v-simple-table>
      <template v-slot:default>
        <thead>
        <tr>
          <th></th>
          <th class="text-left">Allowed</th>
          <th class="text-left">Full trust</th>
          <th class="text-left">Host</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in sites" :key="item.id">
          <td>
            <remove :id="item.id"/>
          </td>
          <td>
            <v-icon v-if="item.isPermitted">mdi-plus</v-icon>
            <v-icon v-else>mdi-minus</v-icon>
          </td>
          <td>
            <v-icon v-if="item.isTrusted" color="error">mdi-plus</v-icon>
            <v-icon v-else>mdi-minus</v-icon>
          </td>
          <td>{{ item.host }}</td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
import {mapState} from "vuex";
import Remove from "./Remove";

export default {
  components: {Remove},
  data: () => ({}),
  computed: {
    ...mapState('wallet', {networkId: 'network', walletId: 'walletId'}),
    ...mapState('sites', {allSites: 'sites'}),
    sites() {
      return this.allSites.filter(e => e.networkId === this.networkId && e.walletId === this.walletId)
    }
  },
}
</script>

<style lang="scss">
.sitesView {
  th, td {
    padding: 0 8px !important;
  }
}
</style>
