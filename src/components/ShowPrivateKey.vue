<template>
  <div class="showPrivateKey">
    <div class="error--text" v-text="error"/>
    <div v-if="null!==privateKey" class="showPrivateKey__key">
      <v-text-field :value="privateKey" :label="$t('walletSettings.privateKey')" disabled/>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs"
                 v-on="on"
                 v-clipboard="privateKey"
                 @success="$snack.success({text: $t('common.copied')})"
                 @error="$snack.danger({text: $t('common.error')})"
                 class="showPrivateKey__key__copy"
                 icon small
          >
            <v-icon color="primary" small>mdi-content-copy</v-icon>
          </v-btn>
        </template>
        <span v-text="$t('common.copy')"/>
      </v-tooltip>
    </div>
    <v-btn v-else @click="show" :loading="loading" small v-text="$t('walletSettings.showPrivate')"/>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import BackgroundApi from "@/api/background";
import {decryptPrivateKeyTask} from "@/lib/task/items";

export default {
  props: {walletId: Number},
  data: () => ({
    loading: false,
    privateKey: null,
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
        BackgroundApi.request(decryptPrivateKeyTask, {password, walletId: this.walletId}).then(function (privateKey) {
          this.privateKey = privateKey;
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
.showPrivateKey {
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
