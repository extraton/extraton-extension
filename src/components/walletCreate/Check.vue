<template>
  <div>
    <view-title v-text="$t('createWallet.checkIt')"/>
    <v-form v-model="valid" ref="form" lazy-validation>
      <v-text-field :rules="[$validation.required, word(3)]" label="3"/>
      <v-text-field :rules="[$validation.required, word(7)]" label="7"/>
      <v-text-field :rules="[$validation.required, word(12)]" label="12"/>
      <div class="text-center">
        <v-btn @click="confirm" :loading="isGoingToWallet" color="primary" class="ma-5" v-text="$t('common.confirm')"/>
      </div>
    </v-form>
  </div>
</template>

<script>
import ViewTitle from "@/components/ViewTitle";
import {mapActions, mapState} from 'vuex';

export default {
  components: {ViewTitle},
  data: () => ({
    valid: true,
  }),
  mounted() {
  },
  computed: {
    ...mapState('walletCreate', [
      'isGoingToWallet',
      'seed',
    ]),
  },
  methods: {
    ...mapActions('walletCreate', [
      'goToWallet',
    ]),
    ...mapActions('password', {
      askPassword: 'ask',
    }),
    async confirm() {
      await this.$refs.form.validate();
      if (this.valid) {
        this.askPassword().then(async (pass) => {
          await this.goToWallet(pass);
        }).catch(() => null);
      }
    },
    word(n) {
      return function (value) {
        return value === this.seed.split(" ")[n - 1] || this.$t('validation.wrongWord');
      }.bind(this)
    },
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
