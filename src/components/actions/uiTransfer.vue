<template>
  <div class="uiTransferAction">
    <div class="text-center uiTransferAction__icon">
      <v-icon>mdi-cash-multiple</v-icon>
    </div>
    <div v-if="null===task.preparation">
      <v-text-field v-model="address" @input="sync" :rules="[$validation.required]" :disabled="disabled"
                    :label="$t('actionDialog.type.2.address')"/>
      <v-text-field v-model="amount" @input="sync" :rules="[$validation.required, $validation.gt(0)]"
                    :disabled="disabled" type="number" :label="$t('actionDialog.type.2.amount')"/>
      <v-text-field v-model="comment" @input="sync" :rules="[$validation.transferCommentLength]" counter="120"
                    :disabled="disabled" :label="$t('actionDialog.type.2.comment')"/>
    </div>
    <div v-else>
      <div class="subtitle-2" v-text="$t('actionDialog.type.2.toAddress')"/>
      <addr :address="task.preparation.address" class="uiTransferAction__address"/>
      <amount :info="$t('actionDialog.type.2.amount')" symbol="TON" :value="task.form.amount"/>
      <amount :info="$t('actionDialog.estimatedFee')" symbol="TON" :value="task.preparation.fee" :convert="[9,3]"
              approx/>
      <template v-if="'' !== task.form.comment">
        <div class="subtitle-2">{{ $t('actionDialog.type.2.comment') }}:</div>
        <div class="text-body-1">{{ task.form.comment }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import amount from "@/components/amount";
import addr from "@/components/addr";

export default {
  components: {amount, addr},
  props: {disabled: Boolean, task: Object},
  data: () => ({
    address: '',
    amount: '',
    comment: '',
  }),
  created() {
    this.address = this.task.form.address || '';
    this.amount = this.task.form.amount || '';
    this.comment = this.task.form.comment || '';
  },
  methods: {
    sync() {
      this.$emit('formChange', {
        address: this.address.trim(),
        amount: this.amount.trim(),
        comment: this.comment.trim(),
      });
    },
  }
}
</script>

<style lang="scss">
.uiTransferAction {
  &__address {
    margin: 3px 0;
  }

  &__icon {
    margin: 10px 0;

    i {
      font-size: 55px !important;
    }
  }
}
</style>
