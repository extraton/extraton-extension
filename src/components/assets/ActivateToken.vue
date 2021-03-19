<template>
  <div class="text-center">
    <v-btn @click="activateToken(tokenId)" :loading="isTokenActivatingInit" color="primary" small>activate</v-btn>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  props: {
    tokenId: Number,
  },
  data: () => ({
  }),
  computed: {
    ...mapState('token', [
      'isTokenActivatingInit'
    ]),
  },
  methods: {
    ...mapActions('token', [
      'activateToken'
    ]),
  }
}
</script>

<style lang="scss">
</style>
