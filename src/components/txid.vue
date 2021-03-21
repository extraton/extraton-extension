<template>
  <div class="txid">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs"
               v-on="on"
               v-clipboard="txid"
               @success="$snack.success({text: 'Copied'})"
               @error="$snack.danger({text: 'Copy Error'})"
               icon small
        >
          <v-icon color="primary" small>mdi-content-copy</v-icon>
        </v-btn>
      </template>
      <span>Copy transaction id</span>
    </v-tooltip>

    <span class="text-overline">0</span>
    <span class="text-overline" style="text-transform:lowercase!important">x</span>
    <span class="text-overline">{{ txid.substr(2) }}</span>

  </div>
</template>

<script>
export default {
  props: {txid: String,},
}
</script>

<style lang="scss">
.txid {
  display: flex;
  justify-content: center;
  align-items: center;

  &__iconCopy {
    margin-right: 5px;
  }
}
</style>
