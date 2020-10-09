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
    <div class="text-center">
      <v-btn @click="restore" :loading="isRestoring" color="primary">restore</v-btn>
    </div>
  </div>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  components: {ViewTitle},
  data: () => ({
    seed: '',
    error: null,
    isRestoring: false,
  }),
  computed: {
    ...mapState('keys', [
      'keys',
    ]),
  },
  beforeDestroy() {
    this.clearKeysStore();
  },
  methods: {
    ...mapMutations('keys', {
      clearKeysStore: 'clear',
    }),
    ...mapActions('keys', [
      'restoreKeys',
    ]),
    ...mapMutations('wallet', {
      setKeysToWallet: 'setKeys',
    }),
    ...mapActions('wallet', [
      'enterWallet',
    ]),
    async restore() {
      this.isRestoring = true;
      this.error = null;
      this.restoreKeys(this.seed.trim()).then(async function () {
        this.setKeysToWallet(this.keys);
        await this.enterWallet();
      }.bind(this)).catch(function (err) {
        this.error = err.toString();
        this.isRestoring = false;
      }.bind(this));
    },
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
}
</style>
