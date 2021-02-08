<template>
  <v-textarea v-model="seed_"
              :rules="notRequired?[]:[rules.required, wordsNum]"
              :rows="rows"
              :disabled="disabled"
              @change="change"
              label="Seed phrase"
              class="seedTextarea"
              filled auto-grow
              counter
  >

    <template v-slot:counter="{props}">
      <v-counter v-bind="props" :value="`${matchSeed.length}/12`"/>
    </template>
  </v-textarea>
</template>

<script>
export default {
  props: {rows: Number, disabled: {type: Boolean, default: false}, notRequired: {type: Boolean, default: false}},
  data: () => ({
    seed_: '',
    rules: {
      required: value => !!value || 'Required.',
    },
  }),
  mounted() {
    this.change();
  },
  computed: {
    matchSeed() {
      if (null === this.seed_) {
        return [];
      }
      const r = this.seed_.match(/[^\s-.]+/g);
      return null !== r ? r : [];
    },
  },
  methods: {
    wordsNum() {
      return this.matchSeed.length !== 12
        ? 'Should be 12 words.'
        : true;
    },
    change(){
      this.$emit('input', this.matchSeed.join(' ').toLowerCase());
    }
  }
}
</script>

<style lang="scss">
.seedTextarea{
  font-size: 20px;
}
</style>
