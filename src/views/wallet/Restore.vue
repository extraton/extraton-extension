<template>
  <v-container class="walletRestore">
    <v-form v-model="valid" ref="form" lazy-validation>
      <view-title v-text="$t('restore.title')"/>
      <v-textarea v-model="seed"
                  :rules="[$validation.required, $validation.wordsNum]"
                  :rows="3"
                  :label="$t('common.seedPhrase')"
                  class="walletRestore__seed"
                  filled auto-grow
                  counter
      >

        <template v-slot:counter="{props}">
          <v-counter v-bind="props" :value="`${matchSeed.length}/12 ${$t('common.or')} 24`"/>
        </template>
      </v-textarea>
      <contract-select v-model="contractId"/>
      <agreement/>
      <div class="walletRestore__error error--text">{{ error }}</div>
      <div class="text-center">
        <v-btn @click="validateAndRestore" :loading="isRestoring" color="primary" v-text="$t('restore.restore')"/>
      </div>
    </v-form>
  </v-container>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import Agreement from "@/components/Agreement";
import {mapActions, mapMutations, mapState} from "vuex";
import ContractSelect from "@/components/ContractSelect";

export default {
  components: {ContractSelect, ViewTitle, Agreement},
  data: () => ({
    seed: '',
    valid: true,
    contractId: null,
  }),
  computed: {
    ...mapState('walletRestore', [
      'error',
      'isRestoring',
    ]),
    matchSeed() {
      const r = this.seed.match(/[^\s-.]+/g);
      return null !== r ? r : [];
    },
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    ...mapMutations('walletRestore', [
      'clear',
    ]),
    ...mapActions('walletRestore', [
      'restore',
    ]),
    ...mapActions('password', {
      askPassword: 'ask',
    }),
    async validateAndRestore() {
      await this.$refs.form.validate();
      if (this.valid) {
        this.askPassword().then(async (pass) => {
          const seed = this.matchSeed.join(' ').toLowerCase();
          await this.restore({seed, contractId: this.contractId, pass});
        }).catch(() => null);
      }
    }
  },
}
</script>

<style lang="scss">
.walletRestore {
  &__seed {
    margin: 25px 0 10px !important;

    textarea {
      font-size: 20px;
    }
  }

  &__error {
    //height: 42px;
    padding: 13px 0;
  }
}
</style>
