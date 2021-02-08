<template>
  <v-dialog v-model="isDialogShowing" content-class="passwordDialog" fullscreen>
    <v-card class="passwordDialog__card">
      <v-card-title>Decode keystore file</v-card-title>
      <v-card-text class="ma-auto">
        <v-text-field v-model="password" type="password" class="ma-auto"
                      label="Keystore file password" outlined/>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="cancel" text small>Cancel</v-btn>
        <v-spacer/>
        <v-btn @click="confirm" color="primary" small>Decrypt</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapState, mapMutations} from "vuex";

export default {
  computed: {
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
  },
  methods: {
    ...mapMutations('password', [
      'onPasswordChange',
      'confirm',
      'cancel',
    ]),
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
