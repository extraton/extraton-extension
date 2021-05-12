<template>
  <div class="getTokens text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" href="https://faucet.extraton.io" target="_blank" x-large icon>
          <v-icon color="primary" large>
            mdi-water-pump
          </v-icon>
        </v-btn>
      </template>
      <span v-text="$t('common.requestTokens')"/>
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
