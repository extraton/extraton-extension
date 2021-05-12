<template>
  <v-select v-model="contractId"
            :items="contracts"
            :label="$t('common.contract')"
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
</template>

<script>
import walletContractLib from "@/lib/walletContract";

export default {
  props: {value: Number},
  data() {
    return {
      contractId: this.value,
    };
  },
  watch: {
    contractId() {
      this.$emit('input', this.contractId);
    }
  },
  computed: {
    contracts(){
      return walletContractLib.compileSelectData(this._i18n)
    }
  },
  mounted() {
    this.contractId = walletContractLib.ids.safeMultisig;
  },
  methods: {
  },
}
</script>

<style lang="scss">
</style>
