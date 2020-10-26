<template>
  <div class="deployContractAction">
    <div>
      <div class="text-center deployContractAction__icon">
        <v-icon>mdi-file-export</v-icon>
      </div>
      <div class="text-body-1">Contract deploying.</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {disabled: Boolean},
}
</script>

<style lang="scss">
.deployContractAction {
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