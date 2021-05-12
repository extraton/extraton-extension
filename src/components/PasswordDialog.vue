<template>
  <v-dialog v-model="isDialogShowing" content-class="passwordDialog" fullscreen>
    <v-card class="passwordDialog__card">
      <v-form v-model="valid" @submit.prevent="submit" ref="form" style="display:contents">
        <v-card-title>{{ isPasswordSet ? $t('password.enter') : $t('password.create') }}
        </v-card-title>
        <v-card-text class="ma-auto">
          <v-text-field v-model="password" type="password" class="ma-auto"
                        :label="$t('password.password2')" :rules="rules" ref="pass" outlined/>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="cancel" text small v-text="$t('common.cancel')"/>
          <v-spacer/>
          <v-btn color="primary" type="submit" small>{{ isPasswordSet ? $t('common.confirm') : $t('common.create') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapState, mapMutations} from "vuex";

export default {
  data() {
    return {
      valid: true,
    }
  },
  watch: {
    isDialogShowing(b) {
      if (b) {
        setTimeout(function () {
          this.$refs['pass'].focus();
        }.bind(this), 200);
      }
    }
  },
  computed: {
    ...mapState('wallet', [
      'isPasswordSet',
    ]),
    ...mapState('password', [
      'isDialogShowing',
    ]),
    password: {
      get() {
        return this.$store.state.password.password;
      },
      set(value) {
        this.$store.commit('password/onPasswordChange', value);
      },
    },
    rules() {
      let rules = [this.$validation.required];
      if (!this.isPasswordSet) {
        rules.push(this.len);
      }
      return rules;
    },
  },
  methods: {
    ...mapMutations('password', [
      'onPasswordChange',
      'confirm',
      'cancel',
    ]),
    len(value) {
      return null !== value && value.length > 7 || this.$t('validation.minimumCharacters', [8]);
    },
    async submit() {
      await this.$refs.form.validate();
      if (this.valid) {
        this.confirm();
      }
    }
  }
}
</script>

<style lang="scss">
.passwordDialog {
  &__card {
    display: flex;
    flex-direction: column;
  }
}
</style>
