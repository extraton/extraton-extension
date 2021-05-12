<template>
  <v-container class="settingsView">
    <div class="text-h6 mb-2" v-text="$t('settings.language.title')"/>
    <select-language/>
  </v-container>
</template>

<script>
import SelectLanguage from "@/components/SelectLanguage";

export default {
  components: {SelectLanguage},
  data: () => ({}),
  computed: {
  },
}
</script>

<style lang="scss">
.settingsView {
}
</style>
