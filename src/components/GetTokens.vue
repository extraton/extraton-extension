<template>
  <div class="getTokens text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" x-large icon :loading="isGettingTokensFromFaucet"
               :disabled="!isFaucetAvailable">
          <v-icon @click="getTokensFromFaucet({snack: $snack, network})" color="primary" large>
            mdi-water-pump
          </v-icon>
        </v-btn>
      </template>
      <span>Request Tokens</span>
    </v-tooltip>
  </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from "vuex";

export default {
  computed: {
    ...mapGetters('wallet', [
      'isGettingTokensFromFaucet',
      'isFaucetAvailable',
    ]),
    ...mapState('wallet', [
      'network',
    ]),
  },
  methods: {
    ...mapActions('wallet', [
      'getTokensFromFaucet'
    ]),
  }
}
</script>

<style lang="scss">
.getTokens {
}
</style>
