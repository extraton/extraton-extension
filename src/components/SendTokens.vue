<template>
  <div class="getTokens text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" disabled x-large icon>
          <v-icon color="primary" large>mdi-send</v-icon>
        </v-btn>
      </template>
      <span>Send Tokens</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss">
.getTokens {
}
</style>
