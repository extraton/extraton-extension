<template>
  <div class="uiAddTokenAction">
    <div>
      <div class="text-center uiAddTokenAction__icon">
        <v-icon>$vuetify.icons.coins</v-icon>
      </div>
      <v-text-field v-model="address" @input="sync" :rules="[rules.required]" :disabled="disabled"
                    label="Root Contract Address"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {disabled: Boolean, form: Object},
  data: () => ({
    address: '',
    rules: {
      required: value => !!value || 'Required.',
    },
  }),
  created() {
    this.address = this.form.address || '';
  },
  methods: {
    sync() {
      this.$emit('formChange', {
        address: this.address.trim(),
      });
    },
  }
}
</script>

<style lang="scss">
.uiAddTokenAction {
  &__icon {
    margin: 20px 0;

    svg {
      width: 55px !important;
      height: 55px !important;
    }
  }
}
</style>
