<template>
  <v-dialog v-model="isDialogShowing" content-class="actionDialog" persistent>
    <v-form v-model="valid" ref="form" lazy-validation>
      <v-card v-if="task" class="actionDialog__card">
        <div style="height:315px">
          <v-card-title class="actionDialog__card__title">
            {{ $t(`actionDialog.type.${task.typeId}.name`) }}
          </v-card-title>
          <v-card-subtitle v-if="activeTasksAmount > 1" class="actionDialog__card__subtitle text-overline">
            Action 1 of {{ activeTasksAmount }}
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
            <ui-transfer-token v-if="task.typeId === interactiveTaskType.uiTransferToken"
                               @formChange="formChange"
                               :form="task.form"
                               :disabled="!isApplyButtonEnabled"
                               :fees="task.data.fees"/>
            <transfer-token v-if="task.typeId === interactiveTaskType.transferToken"
                               @formChange="formChange"
                               :form="task.form"
                               :disabled="!isApplyButtonEnabled"
                               :token-name="task.data.tokenName"
                               :token-symbol="task.data.tokenSymbol"
                               :address="task.params.address"
                               :amount-view="task.data.amountView"
                               :balance-view="task.data.balanceView"/>
            <deploy-contract v-if="task.typeId === interactiveTaskType.deployContract"
                             @formChange="formChange"
                             :form="task.form"
                             :disabled="!isApplyButtonEnabled"/>
            <pre-deploy-transfer v-if="task.typeId === interactiveTaskType.preDeployTransfer"
                                 @formChange="formChange"
                                 :form="task.form"
                                 :disabled="!isApplyButtonEnabled"
                                 :amount="task.params.options.initAmount"/>
            <run v-if="task.typeId === interactiveTaskType.runTransaction"
                 @formChange="formChange"
                 :form="task.form"
                 :disabled="!isApplyButtonEnabled"
                 :fees="task.data.fees"/>
            <call-contract-method v-if="task.typeId === interactiveTaskType.callContractMethod"
                 @formChange="formChange"
                 :form="task.form"
                 :disabled="!isApplyButtonEnabled"
                 :fees="task.data.fees"
                 :address="task.params.address"
                 :method="task.params.method"/>
            <transfer v-if="task.typeId === interactiveTaskType.transfer"
                      @formChange="formChange"
                      :form="task.form"
                      :disabled="!isApplyButtonEnabled"
                      :amount="task.params.amount"
                      :address="task.params.address"
                      :wallet-address="task.params.walletAddress"
                      :is-current-address="task.data.isItLoggedWalletAddress"/>
            <confirm-transaction v-if="task.typeId === interactiveTaskType.confirmTransaction"
                                 @formChange="formChange"
                                 :form="task.form"
                                 :disabled="!isApplyButtonEnabled"
                                 :txid="task.params.txid"
                                 :wallet-address="task.params.walletAddress"/>
            <ui-add-token v-if="task.typeId === interactiveTaskType.uiAddToken"
                       @formChange="formChange"
                       :form="task.form"
                       :disabled="!isApplyButtonEnabled"/>
            <add-token v-if="task.typeId === interactiveTaskType.addToken"
                       @formChange="formChange"
                       :disabled="!isApplyButtonEnabled"
                       :rootAddress="task.params.rootAddress"
                       :name="task.data.name"
                       :symbol="task.data.symbol"/>
            <sign v-if="task.typeId === interactiveTaskType.sign"
                       @formChange="formChange"
                       :disabled="!isApplyButtonEnabled"
                       :unsigned="task.params.unsigned"/>
            <site-permissions v-if="task.typeId === interactiveTaskType.permitSite"
                       @formChange="formChange"
                       :disabled="!isApplyButtonEnabled"
                       :host="task.data.host"/>
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
            <v-btn @click="submit"
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
import deployContract from "@/components/actions/deployContract";
import {mapGetters, mapActions} from "vuex";
import {interactiveTaskType} from '@/db/repository/interactiveTaskRepository';
import PreDeployTransfer from "@/components/actions/preDeployTransfer";
import run from "@/components/actions/run";
import Transfer from "@/components/actions/transfer";
import ConfirmTransaction from "@/components/actions/confirmTransaction";
import AddToken from "@/components/actions/addToken";
import UiAddToken from "@/components/actions/uiAddToken";
import UiTransferToken from "@/components/actions/uiTransferToken";
import TransferToken from "@/components/actions/transferToken";
import CallContractMethod from "@/components/actions/callContractMethod";
import Sign from "@/components/actions/sign";
import SitePermissions from "./actions/sitePermissions";

export default {
  components: {
    SitePermissions,
    Sign,
    CallContractMethod,
    UiTransferToken,
    AddToken,
    UiAddToken,
    Transfer,
    ConfirmTransaction,
    PreDeployTransfer,
    walletActivationAction,
    uiTransferAction,
    deployContract,
    run,
    TransferToken
  },
  data: () => ({
    interactiveTaskType,
    valid: true,
  }),
  computed: {
    ...mapGetters('action', {
      isDialogShowing: 'isDialogShowing',
      task: 'currentTask',
      activeTasksAmount: 'activeTasksAmount',
      isCancelButtonEnabled: 'isCancelButtonEnabled',
      isCancelButtonLoading: 'isCancelButtonLoading',
      isApplyButtonEnabled: 'isApplyButtonEnabled',
      isApplyButtonLoading: 'isApplyButtonLoading',
    }),
    ...mapGetters('wallet', [
      'isKeysEncrypted',
    ])
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
        if (this.isKeysEncrypted) {
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
  height: 360px;
  margin: 0 auto !important;
  width: 290px !important;
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
      height: 100%;
    }
  }
}
</style>
