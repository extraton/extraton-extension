<template>
  <img :src="require(`@/assets/crystal48.png`)" :style="{width, height}" />
</template>

<script>
export default {
  props: {
    iconName: {
      type: String,
      default: 'ton-crystal'
    },
    width: {
      type: [Number, String],
      default: 18
    },
    height: {
      type: [Number, String],
      default: 18
    },
    iconColor: {
      type: String,
      default: 'currentColor'
    }
  }
}
</script>
