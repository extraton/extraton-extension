<template>
  <v-snackbar v-model="snack.isShow">{{ snack.text }}</v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      snack: {isShow: false, text: ''},
    }
  },
  created() {
    this.$snack.listener = function (text) {
      this.snack.text = text;
      this.snack.isShow = false;
      this.snack.isShow = true;
    }.bind(this);
  },
}
</script>

<style>
.v-snack__wrapper {
  min-width: auto !important;
}
</style>