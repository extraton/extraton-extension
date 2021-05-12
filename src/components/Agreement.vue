<template>
  <v-checkbox :rules="[rules.required]" dense>
    <template v-slot:label>
      <div>
        {{$t('agreement.agreed')}}
        <a @click.stop href="https://docs.extraton.io/privacy-policy" target="_blank" v-text="$t('agreement.pp')"/>
      </div>
    </template>
  </v-checkbox>
</template>

<script>
export default {
  data: () => ({
    rules: {
      required: value => !!value || '',
    },
  }),
}
</script>
