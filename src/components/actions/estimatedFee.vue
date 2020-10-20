<template>
  <div class="estimatedFee text-subtitle-1">
    Estimated fee: <span class="font-weight-bold">≈ {{value}}</span>
  </div>
</template>

<script>
export default {
  props: ['value'],
}
</script>

<style lang="scss">
.estimatedFee {
}
</style>