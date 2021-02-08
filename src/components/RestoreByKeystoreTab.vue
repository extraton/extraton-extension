<template>
  <v-card class="setWalletByKeystoreTab" flat>
    <v-form v-model="valid" ref="form">
      <v-card-text>


        <v-alert v-if="created" border="left" type="warning" dense>
          Your keys has been encrypted. Check downloads, securely safe keystore file and password. Losing this
          file or password is equivalent to losing all your funds.
          <br/>Now you can restore your wallet by keystore file.
        </v-alert>
        <v-alert v-else icon="mdi-shield-lock-outline" type="info" prominent text>
          Use your keystore file and password to restore wallet or create it in tab "Encrypt Key" first.
        </v-alert>
        <v-file-input v-model="file" :rules="[rules.required]"
                      accept="application/JSON"
                      label="Keystore file"/>
        <v-text-field v-model="password" :rules="[rules.required]" label="Password" type="password"/>
        <v-select v-model="contractId"
                  :items="contracts"
                  label="Contract"
                  style="margin-top:25px"
                  hide-details dense
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

      </v-card-text>
      <v-card-actions>
        <span class="error--text">{{ error }}</span>
        <v-spacer/>
        <v-btn @click="restore" :loading="isRestoring" color="primary">
          <v-icon left>mdi-backup-restore</v-icon>
          Restore
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import BackgroundApi from "@/api/background";
import {setWalletByKeystoreTask} from "@/lib/task/items";
import walletContractLib from "@/lib/walletContract";
import {mapState} from "vuex";

export default {
  props: {created: Boolean},
  data() {
    return {
      file: null,
      password: null,
      contractId: walletContractLib.ids.safeMultisig,
      isRestoring: false,
      valid: true,
      error: null,
      rules: {
        required: value => !!value || 'Required.',
      },
    }
  },
  computed: {
    ...mapState('walletRestore', [
      'contracts'
    ]),
  },
  methods: {
    async restore() {
      this.error = null;
      await this.$refs.form.validate();
      if (!this.valid) {
        return;
      }

      this.isRestoring = true;
      const reader = new FileReader();
      reader.readAsText(this.file);
      reader.onload = async () => {
        try {
          await BackgroundApi.request(setWalletByKeystoreTask, {
            file: reader.result,
            contractId: this.contractId,
            password: this.password,
            isRestoring: true
          });
          await this.$refs.form.reset();
          this.$emit('restored');
        } catch (err) {
          this.error = err;
        } finally {
          this.isRestoring = false;
        }
      }
    },
  }
}
</script>

<style lang="scss">
.setWalletByKeystoreTab {
}
</style>
