<template>
  <div class="sendTon text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" @click="initTransfer({networkId})" :disabled="!isTransferAvailable" x-large icon>
          <v-icon color="primary" large>mdi-send</v-icon>
        </v-btn>
      </template>
      <span>Send Tokens</span>
    </v-tooltip>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";

export default {
  computed: {
    ...mapState('wallet', {
      networkId: 'network',
    }),
    ...mapGetters('wallet', [
      'isTransferAvailable',
    ]),
  },
  methods: {
    ...mapActions('wallet', [
      'initTransfer'
    ]),
  }
}
</script>

<style lang="scss">
.sendTon {
}
</style>
