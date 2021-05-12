<template>
  <div>
    <view-title v-text="$t('createWallet.title')"/>
    <div>
      <span class="font-weight-bold" v-text="$t('createWallet.warning')"/> {{$t('createWallet.losing')}}
    </div>
    <div class="walletCreate__code text-center text-h5">
      <code v-if="seed">{{ seed }}</code>
      <v-skeleton-loader v-else type="list-item-two-line"/>
    </div>
    <v-form v-model="valid" ref="form" lazy-validation>
      <contract-select v-model="contractId"/>
      <agreement/>
    </v-form>
    <div class="text-center">
      <v-btn @click="saved" :disabled="!seed" color="primary" v-text="$t('createWallet.saved')"/>
    </div>
  </div>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import Agreement from "@/components/Agreement";
import {mapMutations, mapActions, mapState} from 'vuex';
import ContractSelect from "@/components/ContractSelect";
import store from "@/store";

export default {
  components: {ViewTitle, Agreement, ContractSelect},
  data: () => ({
    valid: true,
  }),
  mounted() {
    this.generateSeed();
  },
  computed: {
    ...mapState('walletCreate', [
      'seed',
    ]),
    contractId: {
      get: () => store.state.walletCreate.contractId,
      set: (value) => store.commit('walletCreate/setContractId', value),
    }
  },
  methods: {
    ...mapActions('walletCreate', [
      'generateSeed',
    ]),
    ...mapMutations('walletCreate', [
      'toCheck',
    ]),
    async saved() {
      await this.$refs.form.validate();
      if (this.valid) {
        this.toCheck();
      }
    },
  }
}
</script>

<style lang="scss">
</style>
