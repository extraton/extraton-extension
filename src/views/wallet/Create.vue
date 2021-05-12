<template>
  <v-container class="walletCreate">
    <check v-if="saved"/>
    <generate v-else/>
  </v-container>
</template>

<script>
import {mapMutations, mapState} from 'vuex';
import Generate from "@/components/walletCreate/Generate";
import Check from "@/components/walletCreate/Check";

export default {
  components: {Check, Generate},
  data: () => ({
  }),
  computed: {
    ...mapState('walletCreate', [
      'saved',
    ]),
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    ...mapMutations('walletCreate', [
      'clear',
    ]),
  }
}
</script>

<style lang="scss">
.walletCreate {
  &__code {
    margin: 20px 0 30px;

    code {
      background-color: #fbe5e1 !important;
      color: #c0341d !important;
      font-weight: 900;
      font-size: 75%;
    }
  }
}
</style>
