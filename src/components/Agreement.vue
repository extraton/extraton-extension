<template>
  <v-checkbox :rules="[rules.required]" dense>
    <template v-slot:label>
      <div>
        I'm agreed with
        <a @click.stop href="https://docs.extraton.io/privacy-policy" target="_blank">Privacy Policy</a>
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
