<template>
  <div class="estimatedFee text-subtitle-1">
    {{ info }}: <span class="font-weight-bold"><span v-if="approx">≈ </span>
    <template v-if="null !== value">{{ value }}</template>
    <template v-else>UNKNOWN</template>
  </span>
    <template v-if="symbol&&null!==value"> {{ symbol }}</template>
  </div>
</template>

<script>
export default {
  props: {info: String, value: String, approx: {type: Boolean, default: false}, symbol: String},
}
</script>

<style lang="scss">
.estimatedFee {
}
</style>
