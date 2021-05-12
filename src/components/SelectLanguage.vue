<template>
  <v-select @change="changeLanguage" :items="localesSelectData" :value="language" class="selectLanguage ma-auto"
             label="Language" hide-details single-line filled dense/>
</template>

<script>
import {mapState, mapActions} from "vuex";

export default {
  props: {},
  computed: {
    ...mapState('settings', [
      'language',
    ]),
    localesSelectData() {
      let items = [];
      for (const lang of this._i18n.availableLocales) {
        items.push({value: lang, text: this.$t(`settings.language.items.${lang}`)});
      }
      return items;
    },
  },
  mounted() {
  },
  methods: {
    ...mapActions('settings', [
          'changeLanguage'
        ]
    ),
  }
}
</script>

<style lang="scss">
.selectLanguage{
  width: 250px;
}
</style>
