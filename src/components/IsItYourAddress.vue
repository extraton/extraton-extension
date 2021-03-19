<template>
  <div class="isItYourAddress">
    <v-card style="z-index:1">
      <v-card-text class="text-center text-subtitle-2">
        Is it your address?
      </v-card-text>
      <v-card-actions>
        <v-btn href="https://docs.extraton.io/getting-started/contracts-support" target="_blank" color="primary" small>Info</v-btn>
        <v-spacer/>
        <v-btn @click="$emit('yes')" color="primary" small>Yes</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
.isItYourAddress {
  position: absolute;

  .v-card {
    background: rgba(0, 0, 0, 0.75);
    left: 105px;
    top: 10px;

    &__text {
      //color: #fff !important;
      padding: 12px;
    }

    &__actions {
      padding: 0 8px 8px 8px;
    }
  }
}
</style>
