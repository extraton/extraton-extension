<template>
  <div class="addTokenAction">
    <div>
      <div class="text-center addTokenAction__icon">
        <v-icon>$vuetify.icons.coins</v-icon>
      </div>
      <addr :address="rootAddress"/>
      <div class="text-center text-h6">{{symbol}}</div>
      <div class="text-center subtitle-1">{{name}}</div>
    </div>
  </div>
</template>

<script>
import Addr from "@/components/addr";
export default {
  components: {Addr},
  props: {disabled: Boolean, rootAddress: String, name: String, symbol: String},
  data: () => ({}),
  created() {
  },
  methods: {
  }
}
</script>

<style lang="scss">
.addTokenAction {
  &__icon {
    margin: 20px 0;

    svg {
      width: 55px !important;
      height: 55px !important;
    }
  }
}
</style>
