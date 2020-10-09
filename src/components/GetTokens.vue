<template>
  <div class="getTokens text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" x-large icon disabled>
          <v-icon v-if="isDevNetwork" color="primary" large>mdi-water-pump</v-icon>
          <v-icon v-else color="primary" large>mdi-cart-arrow-down</v-icon>
        </v-btn>
      </template>
      <span>Buy Tokens</span>
    </v-tooltip>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  computed: {
    ...mapGetters('wallet', [
      'isDevNetwork',
    ]),
  }
}
</script>

<style lang="scss">
.getTokens {
}
</style>
