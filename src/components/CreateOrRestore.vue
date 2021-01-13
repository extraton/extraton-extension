<template>
  <div class="createOrRestore text-center">
    <div>
      <v-btn :to="{name:routeRestore}" @click="$emit('choose')" color="primary">
        Restore via seed
      </v-btn>
    </div>
    <div class="createOrRestore__or text-h6">or</div>
    <div>
      <v-btn :to="{name:routeCreate}" @click="$emit('choose')" small text>
        create new wallet
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    routeCreate: String,
    routeRestore: String,
  }
}
</script>

<style lang="scss">
.createOrRestore {
  padding: 20px 0 50px 0;
  //padding: 50px 0;

  &__or {
    padding: 15px 0 9px;
  }
}
</style>
