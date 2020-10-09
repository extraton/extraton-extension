<template>
  <div class="startView text-center">
    <div>
      <v-btn @click="goToRestoreWallet" color="primary">
        Restore via seed
      </v-btn>
    </div>
    <div class="startView__or text-h6">or</div>
    <div>
      <v-btn @click="goToCreateWallet" small text>
        create new wallet
      </v-btn>
    </div>
  </div>
</template>

<script>
import {mapActions} from 'vuex';

export default {
  methods: {
    ...mapActions('start', [
      'goToCreateWallet',
      'goToRestoreWallet',
    ]),
  }
}
</script>

<style lang="scss">
.startView {
  padding: 50px 0 0;

  &__or {
    padding: 15px 0 9px;
  }
}
</style>
