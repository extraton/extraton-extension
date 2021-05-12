<template>
  <div class="estimatedFee text-subtitle-1">
    <span class="text-subtitle-2">{{ info }}:</span> <span class="font-weight-bold"><span v-if="approx">≈ </span>
    {{ amount }}
  </span>
    <template v-if="symbol&&null!==value"> {{ symbol }}</template>
  </div>
</template>

<script>
import walletLib from "@/lib/wallet";

export default {
  props: {
    info: String,
    value: String,
    approx: {type: Boolean, default: false},
    symbol: String,
    convert: {type: Array, default: null}
  },
  computed: {
    amount() {
      return null !== this.convert
          ? walletLib.convertToView(this.value, this.convert[0], this.convert[1])
          : this.value;
    }
  }
}
</script>

<style lang="scss">
.estimatedFee {
}
</style>
