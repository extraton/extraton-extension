<template>
  <v-container class="settingsView">
    <v-card color="error" dark>
          <v-card-title class="headline">Alpha features</v-card-title>
          <v-card-subtitle>For development purposes only!</v-card-subtitle>
      <v-card-text>
        <span class="font-weight-bold">Enabling unstable functionality may lead to extension glitching and loss of funds!</span>
        <v-checkbox v-model="tip3" label="TIP-3 Fungible Tokens"/>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  components: {},
  data: () => ({}),
  computed: {
    tip3: {
      get () {
        return this.$store.state.settings.tip3;
      },
      set (value) {
        this.$store.dispatch('settings/changeTip3', value);
      }
    },
  },
}
</script>

<style lang="scss">
.settingsView {
}
</style>
