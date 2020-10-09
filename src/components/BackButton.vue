<template>
  <v-btn v-if="isShowingBackButton" :to="backRoute" class="backButton" text small exact>
    <v-icon left small>mdi-arrow-left</v-icon>
    Back
  </v-btn>
</template>

<script>
export default {
  computed: {
    isShowingBackButton() {
      return undefined !== this.$route.meta.back;
    },
    backRoute() {
      return this.isShowingBackButton ? {name: this.$route.meta.back} : null;
    },
  },
}
</script>

<style lang="scss">
.backButton {
  padding-left: 0 !important;
}
</style>