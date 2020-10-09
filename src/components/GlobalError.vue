<template>
    <v-alert v-if="text" class="globalError" type="error" dense>
      {{ text }}
    </v-alert>
</template>

<script>
import {mapState} from "vuex";

export default {
  computed: {
    ...mapState('globalError', [
      'text',
    ]),
  },
}
</script>

<style lang="scss">
.globalError {

}
</style>