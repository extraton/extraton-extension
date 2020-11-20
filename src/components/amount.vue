<template>
  <div class="estimatedFee text-subtitle-1">
    {{ info }}: <span class="font-weight-bold"><span v-if="approx">≈ </span>{{value}}</span>
  </div>
</template>

<script>
export default {
  props: {info: String, value: String, approx: {type: Boolean, default: false}},
}
</script>

<style lang="scss">
.estimatedFee {
}
</style>
