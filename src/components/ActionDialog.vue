<template>
  <v-dialog v-model="isDialogShowing" content-class="actionDialog" persistent>
    <v-card>
      <v-card-title class="actionDialog__title">
        {{ currentTask.type }}
      </v-card-title>
      <v-card-subtitle class="actionDialog__subtitle text-overline">
        Action 1 of {{ tasksAmount }}
      </v-card-subtitle>

      <v-card-text class="actionDialog__body">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn @click="dialog = false" text small>
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="dialog = false"
          small
        >
          I accept
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  computed: {
    ...mapGetters('action', [
      'isDialogShowing',
      'currentTask',
      'tasksAmount',
    ]),
  },
}
</script>

<style lang="scss">
.actionDialog {
  margin: 5px !important;

  &__title {
    padding: 10px !important;
  }

  &__subtitle {
    padding: 0 10px 3px 10px !important;
  }

  &__body {
    padding: 0 10px 10px !important;
  }
}
</style>