<template>
  <div class="text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" x-large icon disabled>
          <v-icon color="primary" large>mdi-cart-arrow-down</v-icon>
        </v-btn>
      </template>
      <span>Buy Tokens</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {}
</script>
