<template>
  <v-dialog v-model="isDialogShowing" v-on:click:outside="endEditing" content-class="editWalletDialog" persistent>
    <v-card v-if="wallet">
      <v-card-title style="padding:5px 5px 5px 12px">
        <span class="text-overline">{{ walletLib.addressToView(wallet.address) }}</span>
        <v-spacer></v-spacer>
        <v-btn @click="endEditing" :disabled="isDeleting||isSaving" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text style="padding-top:12px">
        <v-form v-model="valid">
          <v-text-field :value="name" :rules="[$validation.required, maxLength]" @input="inputName"
                        :label="$t('walletSettings.name')"/>
        </v-form>
        <pubkey :pubkey="wallet.pubkey"/>
        <show-private-key :walletId="wallet.id"/>
        <show-seed-phrase :walletId="wallet.id"/>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="isMoreThanOneWallet" @click="removeWallet" :loading="isDeleting" :disabled="isDeleting||isSaving"
               color="error" small v-text="$t('walletSettings.hide')"/>
        <v-spacer/>
        <v-btn @click="save" :loading="isSaving" :disabled="isDeleting||isSaving" color="primary" small
               v-text="$t('common.save')"/>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import walletLib from "@/lib/wallet";
import {mapState, mapMutations, mapActions, mapGetters} from "vuex";
import Pubkey from "@/components/pubkey";
import ShowPrivateKey from "@/components/ShowPrivateKey";
import ShowSeedPhrase from "@/components/ShowSeedPhrase";

export default {
  components: {ShowSeedPhrase, ShowPrivateKey, Pubkey},
  data: () => ({
    walletLib,
    valid: true,
  }),
  computed: {
    ...mapState('walletEdit', [
      'isDialogShowing',
      'isSaving',
      'isDeleting',
      'wallet',
      'name',
    ]),
    ...mapGetters('walletEdit', [
      'isMoreThanOneWallet',
    ]),
  },
  methods: {
    ...mapMutations('walletEdit', [
      'inputName',
      'endEditing',
    ]),
    ...mapActions('walletEdit', [
      'saveWallet',
      'removeWallet',
    ]),
    save() {
      if (this.valid) {
        this.$store.dispatch('walletEdit/saveWallet');
      }
    },
    maxLength(value) {
      return value.length < 25 || this.$t('validation.tooLong');
    },
  }
}
</script>

<style lang="scss">
.editWalletDialog {
  width: 340px !important;
  margin: 0 auto !important;
}
</style>
