<template>
  <div class="uiTransferAction">
    <div>
      <!--      <div class="text-body-1">Transfer tokens to other address.</div>-->
      <!--      <div class="text-center walletActivationAction__icon">-->
      <!--        <v-icon>mdi-send</v-icon>-->
      <!--      </div>-->
      <v-text-field v-model="address" @input="sync" :rules="[rules.required]" :disabled="disabled" label="Address"/>
      <v-text-field v-model="amount" @input="sync" :rules="[rules.required, rules.greaterOrEqualZero]"
                    :disabled="disabled" type="number" label="Amount"/>
    </div>
    <amount info="Estimated fee" value="0.011" approx/>
  </div>
</template>

<script>
import amount from "@/components/amount";

export default {
  components: {amount},
  props: {disabled: Boolean, form: Object},
  data: () => ({
    address: '',
    amount: '',
    rules: {
      required: value => !!value || 'Required.',
      greaterOrEqualZero: value => value - 0 > 0 || 'Must be greater or equal 0.',
    },
  }),
  created() {
    this.address = this.form.address;
    this.amount = this.form.amount;
  },
  methods: {
    sync() {
      this.$emit('formChange', {address: this.address, amount: this.amount});
    },
  }
}
</script>

<style lang="scss">
.uiTransferAction {
  //display: flex;
  //flex-direction: column;
  //justify-content: space-between;
  //height: 100%;
  //padding-bottom: 52px;

  &__icon {
    margin: 20px 0;

    i {
      font-size: 55px !important;
    }
  }
}
</style>
