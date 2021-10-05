<template>
      <v-btn @click="remove(id)" class="removeSite" icon>
        <v-icon>mdi-delete</v-icon>
      </v-btn>
</template>

<script>
import {mapActions} from "vuex";

export default {
  props: {
    id: Number
  },
  methods: {
    ...mapActions('sites', ['remove'])
  }
}
</script>

<style lang="scss">
.removeSite {
}
</style>
