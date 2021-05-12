<template>
  <div class="showSeedPhrase">
    <div class="error--text" v-text="error"/>
    <div v-if="null!==seed" class="showSeedPhrase__key">
      <v-text-field :value="seed" :label="$t('walletSettings.seed')" disabled/>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs"
                 v-on="on"
                 v-clipboard="seed"
                 @success="$snack.success({text: $t('common.copied')})"
                 @error="$snack.danger({text: $t('common.error')})"
                 class="showSeedPhrase__key__copy"
                 icon small
          >
            <v-icon color="primary" small>mdi-content-copy</v-icon>
          </v-btn>
        </template>
        <span v-text="$t('common.copy')"/>
      </v-tooltip>
    </div>
    <v-btn v-else @click="show" :loading="loading" small v-text="$t('walletSettings.showSeed')"/>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import BackgroundApi from "@/api/background";
import {decryptSeedPhraseTask} from "@/lib/task/items";

export default {
  props: {walletId: Number},
  data: () => ({
    loading: false,
    seed: null,
    error: null,
  }),
  computed: {},
  methods: {
    ...mapActions('password', {
      askPassword: 'ask',
    }),
    show() {
      this.askPassword().then(async (password) => {
        this.loading = true;
        this.error = null;
        BackgroundApi.request(decryptSeedPhraseTask, {password, walletId: this.walletId}).then(function (seed) {
          this.seed = seed;
        }.bind(this)).catch(function (e){
          this.error = e;
        }.bind(this)).finally(function () {
          this.loading = false;
        }.bind(this));
      }).catch(() => null);
    }
  }
}
</script>

<style lang="scss">
.showSeedPhrase {
  margin: 10px 0;
  &__key {
    display: flex;
    justify-content: center;
    align-items: center;

    &__copy {
      margin: 0 0 7px 5px;
    }
  }
}
</style>
