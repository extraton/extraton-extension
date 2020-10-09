<template>
  <div class="balance">
    <v-icon :color="isDevNetwork ? '#ce0015' : '#0488cb'">mdi-diamond-stone</v-icon>
    <span v-if="null !== balanceView" class="text-h4">{{ balanceView }}</span>
    <v-skeleton-loader v-else type="heading" width="86"/>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  computed: {
    ...mapGetters('wallet', [
      'balanceView',
      'isDevNetwork',
    ]),
  },
}
</script>

<style lang="scss">
.balance {
  margin: 30px 0;
  display: flex;
  justify-content: center;
  height: 40px;
  align-items: center;

  i {
    padding-right: 5px;
  }

  .v-skeleton-loader__heading {
    width: 100%;
  }
}
</style>
