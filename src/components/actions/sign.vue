<template>
  <div class="signAction">
    <div>
      <div class="text-center signAction__icon">
        <v-icon>mdi-draw</v-icon>
      </div>
      <div class="signAction__unsigned" v-text="unsigned"/>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {disabled: Boolean, unsigned: String},
  data: () => ({}),
  created() {
  },
  methods: {}
}
</script>

<style lang="scss">
.signAction {
  &__icon {
    margin: 10px 0 20px 0;

    i {
      font-size: 55px !important;
    }
  }

  &__unsigned {
    background-color: rgba(0, 0, 0, 0.06);
    color: rgba(0, 0, 0, 0.38);
    font-size: 16px;
    border-radius: 4px 4px 0 0;
    padding: 12px;
    height: 150px;
    overflow: auto;
    white-space: pre-line;
  }
}
</style>
