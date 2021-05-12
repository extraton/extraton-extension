<template>
  <div class="walletActivationAction">
    <div>
      <div class="text-center walletActivationAction__icon">
        <v-icon>mdi-wallet-plus</v-icon>
      </div>
      <div class="text-body-1" v-text="$t('actionDialog.type.1.description', [activeTasksAmount])"/>
    </div>
    <amount v-if="null!==task.preparation" symbol="TON" :info="$t('actionDialog.estimatedFee')" :value="task.preparation.fee" :convert="[9,3]" approx/>
  </div>
</template>

<script>
import amount from "@/components/amount";

export default {
  components: {amount},
  props: {disabled: Boolean, task: Object},
  mounted() {
  }
}
</script>

<style lang="scss">
.walletActivationAction {
  &__icon {
    margin: 20px 0;

    i {
      font-size: 55px !important;
    }
  }
}
</style>
