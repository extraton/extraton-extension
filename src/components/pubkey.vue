<template>
  <div class="pubkey">
    <v-text-field :value="pubkey" label="Public Key" disabled/>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs"
               v-on="on"
               v-clipboard="pubkey"
               @success="$snack.success({text: 'Copied'})"
               @error="$snack.danger({text: 'Copy Error'})"
               class="pubkey__copy"
               icon small
        >
          <v-icon color="primary" small>mdi-content-copy</v-icon>
        </v-btn>
      </template>
      <span>Copy public key</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    pubkey: String,
  },
}
</script>

<style lang="scss">
.pubkey {
  display: flex;
  justify-content: center;
  align-items: center;

  &__copy {
    margin: 0 0 7px 5px;
  }
}
</style>
