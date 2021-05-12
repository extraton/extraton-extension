<template>
  <div class="createOrRestore text-center">
    <div>
      <v-btn :to="{name:routeRestore}" @click="$emit('choose')" color="primary" v-text="$t('createOrRestore.restore')"/>
    </div>
    <div class="createOrRestore__or text-h6" v-text="$t('common.or')"/>
    <div>
      <v-btn :to="{name:routeCreate}" @click="$emit('choose')" small text v-text="$t('createOrRestore.create')"/>
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
