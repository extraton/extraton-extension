<template>
  <div class="runAction">
    <div>
      <div class="text-center runAction__icon">
        <v-icon>mdi-cube-send</v-icon>
      </div>
      <div class="text-body-1">Run transaction.</div>
    </div>
    <amount info="Estimated fee" :value="fees"/>
  </div>
</template>

<script>
import amount from "@/components/amount";

export default {
  components: {amount},
  props: {disabled: Boolean, fees: String},
}
</script>

<style lang="scss">
.runAction {
  //display: flex;
  //flex-direction: column;
  //justify-content: space-between;
  //height: 100%;
  //padding-bottom: 52px;

  &__icon {
    margin: 20px 0;
    i {
      font-size: 55px !important;
    }
  }
}
</style>