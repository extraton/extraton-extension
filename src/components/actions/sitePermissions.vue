<template>
  <div class="sitePermissionsAction">
    <div>
      <div class="text-center sitePermissionsAction__icon">
        <v-icon>mdi-shield-key</v-icon>
      </div>
      <div class="text-body-1">
        Allow <span class="font-weight-bold">{{ host }}</span> to communicate with wallet.
      </div>
      <v-checkbox @change="changeTrust" v-model="trust">
        <template v-slot:label>
          <div>
            Trust this website to perform transactions <span
            class="red--text font-weight-bold">without</span> confirmation.
          </div>
        </template>
      </v-checkbox>
    </div>
  </div>
</template>

<script>

export default {
  props: {disabled: Boolean, host: String},
  data: () => ({
    trust: false,
  }),
  methods: {
    changeTrust() {
      // console.log('formChange');
      this.$emit('formChange', {
        trust: this.trust,
      });
    }
  }
}
</script>

<style lang="scss">
.sitePermissionsAction {
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
