<template>
  <v-dialog v-model="isDialogShowing" content-class="actionDialog" persistent>
    <v-form v-model="valid" ref="form" lazy-validation>
      <v-card v-if="task" class="actionDialog__card">
        <div style="height:365px">
          <v-card-title class="actionDialog__card__title">
            {{ $t(`actionDialog.type.${task.typeId}.name`) }}
          </v-card-title>
          <v-card-subtitle v-if="activeTasksAmount > 1" class="actionDialog__card__subtitle text-overline"
                           v-text="$t('actionDialog.actionCounter', [activeTasksAmount])"/>
          <v-card-text class="actionDialog__card__body">
            <div v-if="task.error" class="error--text">{{ task.error }}</div>
            <wallet-activation-action
                v-if="task.typeId === interactiveTaskType.deployWalletContract"
                @formChange="formChange"
                :task="task"
                :disabled="!isApplyButtonEnabled"/>
            <ui-transfer-action
                v-if="task.typeId === interactiveTaskType.uiTransfer"
                @formChange="formChange"
                :task="task"
                :disabled="!isApplyButtonEnabled"/>
          </v-card-text>
        </div>
        <div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn @click="cancel(task.id)" :disabled="!isCancelButtonEnabled" :loading="isCancelButtonLoading" text
                   small v-text="$t('common.cancel')"/>
            <v-spacer></v-spacer>
            <v-btn @click="submit"
                   color="primary"
                   :disabled="!isApplyButtonEnabled"
                   :loading="isApplyButtonLoading" small
                   v-text="applyButtonText"/>
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
import {interactiveTaskStatus, interactiveTaskType} from '@/db/repository/interactiveTaskRepository';

export default {
  components: {
    walletActivationAction,
    uiTransferAction,
  },
  data: () => ({
    interactiveTaskType,
    valid: true,
  }),
  computed: {
    ...mapGetters('action', {
      task: 'currentTask',
      isDialogShowing: 'isDialogShowing',
      activeTasksAmount: 'activeTasksAmount',
      isCancelButtonEnabled: 'isCancelButtonEnabled',
      isCancelButtonLoading: 'isCancelButtonLoading',
      isApplyButtonEnabled: 'isApplyButtonEnabled',
      isApplyButtonLoading: 'isApplyButtonLoading',
    }),
    applyButtonText() {
      switch (this.task.statusId) {
        case interactiveTaskStatus.prepared:
          return this.$t(`actionDialog.type.${this.task.typeId}.button.apply`);
        case interactiveTaskStatus.process:
          return this.$t(`actionDialog.waiting`)
        default:
          return this.$t(`actionDialog.prepare`)
      }
    }
  },
  methods: {
    ...mapActions('action', [
      'cancel',
      'apply',
      'formChange',
    ]),
    ...mapActions('password', {
      askPassword: 'ask',
    }),
    async submit() {
      await this.$refs.form.validate();
      if (this.valid) {
        let applyData = {interactiveTask: this.task, password: null};
        if (this.task.statusId === interactiveTaskStatus.new) {
          this.askPassword().then(async (password) => {
            applyData.password = password;
            await this.apply(applyData);
          }).catch(() => null);
        } else {
          await this.apply(applyData);
        }
      }
    }
  }
}
</script>

<style lang="scss">
.actionDialog {
  position: absolute !important;
  top: 135px !important;
  height: 410px;
  margin: 0 auto !important;
  width: 340px !important;
  overflow: hidden !important;

  &__card {
    &__title {
      padding: 10px 10px 5px 10px !important;
    }

    &__subtitle {
      padding: 0 10px !important;
    }

    &__body {
      padding: 0 10px !important;
      overflow: auto;
      height: 315px;
    }
  }
}
</style>
