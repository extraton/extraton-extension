<template>
  <div class="estimatedFee text-subtitle-1">
    {{ info }}: <span class="font-weight-bold">≈ {{value}}</span>
  </div>
</template>

<script>
export default {
  props: ['info', 'value'],
}
</script>

<style lang="scss">
.estimatedFee {
}
</style>