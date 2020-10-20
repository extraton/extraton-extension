<template>
  <img :src="require(`@/assets/${img}.png`)" class="coinIcon" :style="{'margin-right': marginRight}" :alt="alt"/>
</template>

<script>
export default {
  props: {
    ruby: Boolean,
    left: Boolean,
  },
  computed: {
    img() {
      return this.ruby ? 'ruby48' : 'crystal48';
    },
    alt() {
      return this.ruby ? 'Ruby' : 'Crystal';
    },
    marginRight() {
      if (this.left) {
        if (this.ruby) {
          return '1px';
        } else {
          return '4px';
        }
      }
      return 0;
    }
  },
}
</script>

<style lang="scss">
.coinIcon {
  width: 24px;
}
</style>