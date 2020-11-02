<template>
  <div class="walletRestore">
    <view-title>Restore your wallet</view-title>
    <v-textarea v-model="seed"
                :error-messages="error"
                :rows="3"
                label="Seed phrase"
                class="walletRestore__seed"
                filled auto-grow
    />
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
    <div class="text-center">
      <v-btn @click="restore({seed, contractId})" :loading="isRestoring" color="primary">restore</v-btn>
    </div>
  </div>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import {mapActions, mapMutations, mapState} from "vuex";
import walletContractLib from '@/lib/walletContract';

export default {
  components: {ViewTitle},
  data: () => ({
    seed: '',
    contractId: walletContractLib.ids.safeMultisig,
  }),
  computed: {
    ...mapState('walletRestore', [
      'error',
      'isRestoring',
      'contracts'
    ]),
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    ...mapMutations('walletRestore', {
      clearKeysStore: 'clear',
    }),
    ...mapActions('walletRestore', [
      'restore',
    ]),
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

  &__contract {
    margin-bottom: 37px!important;
  }
}
</style>
