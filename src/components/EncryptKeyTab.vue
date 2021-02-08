<template>
  <v-card class="encryptKeyTab" flat>
    <v-form v-model="valid" ref="form">
      <v-card-text>
        <v-radio-group v-model="radios">
          <div class="d-table">
            <div class="d-table-row">
              <div class="d-table-cell">
                <v-radio :value="1"/>
              </div>
              <div class="d-table-cell">
                <seed-textarea v-model="seed" :disabled="radios!==1" :rows="2" :not-required="radios!==1"/>
              </div>
            </div>
            <div class="d-table-row">
              <div class="d-table-cell">
                <v-radio :value="2"/>
              </div>
              <div class="d-table-cell">
                <v-textarea v-model="keypair"
                            :rules="radios!==2?[]:[rules.required,isKeypair]"
                            :rows="2"
                            :disabled="radios!==2"
                            label="Json keypair"
                            filled auto-grow
                />
              </div>
            </div>
          </div>
        </v-radio-group>
        <v-text-field v-model="password" :rules="[rules.required]" label="Create Password" type="password"/>
      </v-card-text>
      <v-card-actions>
        <span class="error--text">{{ error }}</span>
        <v-spacer/>
        <v-btn @click="encrypt" :loading="isEncrypting" color="primary">
          <v-icon left>mdi-download-lock</v-icon>
          Encrypt
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import SeedTextarea from "@/components/SeedTextarea";
import BackgroundApi from "@/api/background";
import {encryptKeysTask} from "@/lib/task/items";

export default {
  components: {SeedTextarea},
  data() {
    return {
      seed: '',
      password: '',
      radios: 1,
      isEncrypting: false,
      valid: true,
      error: null,
      keypair: '',
      rules: {
        required: value => !!value || 'Required.',
      },
    }
  },
  computed: {
    isKeypair(v) {
      try {
        v = JSON.parse(v.keypair);
        return typeof v === 'object'
          && Object.keys(v).length === 2
          && typeof v.public === 'string'
          && v.public.match(/^[a-f0-9]{64}$/g) !== null
          && typeof v.secret === 'string'
          && v.secret.match(/^[a-f0-9]{64}$/g) !== null
          || 'Wrong format';
      } catch (e) {
        return 'Incorrect JSON.'
      }
    }
  },
  methods: {
    async encrypt() {
      this.error = null;
      await this.$refs.form.validate();
      if (this.valid) {
        let data;
        if (this.radios === 1) {
          data = this.seed;
        } else if (this.radios === 2) {
          data = JSON.parse(this.keypair);
        } else {
          throw 'Unknown dataType.';
        }
        const dataType = this.radios;
        this.isEncrypting = true;
        try {
          const keystore = await BackgroundApi.request(encryptKeysTask, {data, dataType, password: this.password});
          let element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(keystore)));
          element.setAttribute('download', `freeton-keystore-${keystore.public}.json`);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          await this.$refs.form.reset();
          this.radios = 1;
          this.$emit('created');
        } catch (err) {
          this.error = err;
        } finally {
          this.isEncrypting = false;
        }
      }
    }
  }
}
</script>

<style lang="scss">
.encryptKeyTab {
  .d-table {
    width: 100%;

    .d-table-cell:first-child {
      width: 45px;
    }
  }
}
</style>
