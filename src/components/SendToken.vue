<template>
  <div class="sendToken text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" @click="initTransfer({networkId, tokenId})" :disabled="!isTransferAvailable(tokenId)" x-large icon>
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
  props: {tokenId: Number},
  computed: {
    ...mapGetters('token', {
      getTokenById: 'token',
      isTransferAvailable: 'isTransferAvailable',
    }),
    ...mapState('wallet', {
      networkId: 'network',
    }),
    token() {
      return this.getTokenById(this.tokenId);
    },
  },
  methods: {
    ...mapActions('token', [
      'initTransfer'
    ]),
  }
}
</script>

<style lang="scss">
.sendToken {
}
</style>
