<template>
  <v-container class="walletCreate">
    <view-title>Save your seed</view-title>
    <div>
      <span class="font-weight-bold">WARNING!</span> Losing seed phrase is equivalent to losing all your funds.
    </div>
    <div class="walletCreate__code text-center text-h5">
      <code v-if="seed">{{ seed }}</code>
      <v-skeleton-loader v-else type="list-item-two-line"/>
    </div>
    <v-form v-model="valid" ref="form" lazy-validation>
      <agreement/>
    </v-form>
    <div class="text-center">
      <v-btn @click="validateAndCreate" :disabled="!seed" :loading="isGoingToWallet" color="primary">
        i securely saved it
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import Agreement from "@/components/Agreement";
import {mapMutations, mapActions, mapState} from 'vuex';

export default {
  components: {ViewTitle, Agreement},
  data: () => ({
    valid: true,
  }),
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
    async validateAndCreate() {
      await this.$refs.form.validate();
      if (this.valid) {
        await this.goToWallet();
      }
    }
  }
}
</script>

<style lang="scss">
.walletCreate {
  &__code {
    margin: 20px 0 30px;

    code {
      background-color: #fbe5e1 !important;
      color: #c0341d !important;
      font-weight: 900;
      font-size: 75%;
    }
  }
}
</style>
