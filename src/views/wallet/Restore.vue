<template>
  <div class="walletRestore">
    <v-btn style="top:12px" color="primary" href="/keystore.html" target="_blank" small absolute right text>
      Keystore<sup class="red--text">Beta</sup>
    </v-btn>
    <v-form v-model="valid" ref="form" lazy-validation>
      <view-title>Restore your wallet</view-title>
      <v-textarea v-model="seed"
                  :rules="[rules.required, wordsNum]"
                  :rows="3"
                  label="Seed phrase"
                  class="walletRestore__seed"
                  filled auto-grow
                  counter
      >

        <template v-slot:counter="{props}">
          <v-counter v-bind="props" :value="`${matchSeed.length}/12`"/>
        </template>
      </v-textarea>
      <v-select v-model="contractId"
                :items="contracts"
                label="Contract"
                class="walletRestore__contract"
                hide-details
                filled
                dense
      >
        <template v-slot:item="{item}">
          <v-list-item :value="item.value" dense>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.info }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="mt-2"></v-divider>
        </template>
      </v-select>
      <agreement/>
      <div class="walletRestore__error error--text">{{ error }}</div>
      <div class="text-center">
        <v-btn @click="validateAndRestore" :loading="isRestoring" color="primary">restore</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import Agreement from "@/components/Agreement";
import {mapActions, mapMutations, mapState} from "vuex";
import walletContractLib from '@/lib/walletContract';

export default {
  components: {ViewTitle, Agreement},
  data: () => ({
    seed: '',
    valid: true,
    contractId: walletContractLib.ids.safeMultisig,
    rules: {
      required: value => !!value || 'Required.',
    },
  }),
  computed: {
    ...mapState('walletRestore', [
      'error',
      'isRestoring',
      'contracts'
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
    wordsNum() {
      return this.matchSeed.length !== 12
        ? 'Should be 12 words.'
        : true;
    },
    async validateAndRestore() {
      await this.$refs.form.validate();
      if (this.valid) {
        const seed = this.matchSeed.join(' ').toLowerCase();
        await this.restore({seed, contractId: this.contractId});
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
