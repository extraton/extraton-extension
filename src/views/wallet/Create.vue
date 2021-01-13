<template>
  <div class="walletCreate">
    <view-title>Save your seed</view-title>
    <div>
      <span class="font-weight-bold">WARNING!</span> Losing seed phrase is equivalent to losing all your funds.
    </div>
    <div class="walletCreate__code text-center text-h5">
      <code v-if="seed">{{ seed }}</code>
      <v-skeleton-loader v-else type="list-item-two-line"/>
    </div>
    <div class="text-center">
      <v-btn @click="goToWallet" :disabled="!seed" :loading="isGoingToWallet" color="primary">
        i securely saved it
      </v-btn>
    </div>
  </div>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import {mapMutations, mapActions, mapState} from 'vuex';

export default {
  components: {ViewTitle},
  mounted() {
    this.generateSeed();
  },
  computed: {
    ...mapState('walletCreate', [
      'isGoingToWallet',
      'seed',
    ]),
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    ...mapActions('walletCreate', [
      'generateSeed',
      'goToWallet',
    ]),
    ...mapMutations('walletCreate', [
      'clear',
    ]),
  }
}
</script>

<style lang="scss">
.walletCreate {
  &__code {
    margin: 20px 0 30px;
  }
}
</style>
