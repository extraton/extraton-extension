<template>
  <v-dialog v-model="isDialogShowing" content-class="actionDialog" persistent>
    <v-form v-model="valid" ref="form" lazy-validation>
      <v-card v-if="task" class="actionDialog__card">
        <div style="height:315px">
          <v-card-title class="actionDialog__card__title">
            {{ $t(`actionDialog.type.${task.typeId}.name`) }}
          </v-card-title>
          <v-card-subtitle v-if="tasksAmount > 1" class="actionDialog__card__subtitle text-overline">
            Action 1 of {{ tasksAmount }}
          </v-card-subtitle>
          <v-card-text class="actionDialog__card__body">
            <div v-if="task.error" class="error--text">{{ task.error }}</div>
            <wallet-activation-action v-if="task.typeId === interactiveTaskType.deployWalletContract"
                                      @formChange="formChange"
                                      :form="task.form"
                                      :disabled="!isApplyButtonEnabled"/>
            <ui-transfer-action v-if="task.typeId === interactiveTaskType.uiTransfer"
                                @formChange="formChange"
                                :form="task.form"
                                :disabled="!isApplyButtonEnabled"/>
          </v-card-text>
        </div>
        <div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn @click="cancel(task.id)" :disabled="!isCancelButtonEnabled" :loading="isCancelButtonLoading" text
                   small>
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="submit()"
                   color="primary"
                   :disabled="!isApplyButtonEnabled"
                   :loading="isApplyButtonLoading" small>
              {{ $t(`actionDialog.type.${task.typeId}.button.apply`) }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import walletActivationAction from "@/components/actions/walletActivation";
import uiTransferAction from "@/components/actions/uiTransfer";
import {mapGetters, mapActions} from "vuex";
import {interactiveTaskType} from '@/db/repository/interactiveTaskRepository';

export default {
  components: {walletActivationAction, uiTransferAction},
  data: () => ({
    interactiveTaskType,
    valid: true,
  }),
  computed: {
    ...mapGetters('action', {
      isDialogShowing: 'isDialogShowing',
      task: 'currentTask',
      tasksAmount: 'tasksAmount',
      isCancelButtonEnabled: 'isCancelButtonEnabled',
      isCancelButtonLoading: 'isCancelButtonLoading',
      isApplyButtonEnabled: 'isApplyButtonEnabled',
      isApplyButtonLoading: 'isApplyButtonLoading',
    }),
  },
  methods: {
    ...mapActions('action', [
      'cancel',
      'apply',
      'formChange',
    ]),
    async submit() {
      await this.$refs.form.validate();
      if (this.valid) {
        this.apply({taskId: this.task.id});
      }
    }
  }
}
</script>

<style lang="scss">
.actionDialog {
  position: absolute !important;
  top: 135px !important;
  height: 360px;
  margin: 0 auto !important;
  width: 290px !important;

  &__card {
    &__title {
      padding: 10px 10px 5px 10px !important;
    }

    &__subtitle {
      padding: 0 10px !important;
    }

    &__body {
      padding: 0 10px !important;
      height: 100%;
    }
  }
}
</style>