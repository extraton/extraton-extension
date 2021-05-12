<template>
  <v-list class="transactions" two-line>
    <v-subheader v-text="$t('transactions.title')"/>
    <v-divider/>
    <div v-for="(transaction, index) in transactions" :key="index">
      <v-list-item>
        <v-list-item-icon class="transactions__item__icon">
          <v-icon>mdi-swap-horizontal</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-if="isPositive(transaction.balance_delta)" class="font-weight-bold green--text">
            +{{ walletLib.convertToView(transaction.balance_delta, 9, 3) }}
          </v-list-item-title>
          <v-list-item-title v-else class="font-weight-bold red--text">
            {{ walletLib.convertToView(transaction.balance_delta, 9, 3) }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ walletLib.transactionToView(transaction.id) }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-icon class="transactions__item__actions">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" :href="explorerLink(transaction.id)" target="_blank" icon small>
                <v-icon small>mdi-open-in-new</v-icon>
              </v-btn>
            </template>
            <span v-text="$t('common.openExplorer')"/>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs"
                     v-on="on"
                     v-clipboard="transaction.id"
                     @success="$snack.success({text: $t('common.copied')})"
                     @error="$snack.danger({text: $t('common.error')})"
                     icon small
              >
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span v-text="$t('common.copy')"/>
          </v-tooltip>
        </v-list-item-icon>
      </v-list-item>
      <v-divider/>
    </div>
    <div v-if="0 === transactions.length" class="ma-5 text-center grey--text" v-text="$t('transactions.empty')"/>
  </v-list>
</template>

<script>
import {mapGetters} from "vuex";
import walletLib from "@/lib/wallet";
import BN from "bignumber.js";

export default {
  data: () => ({
    walletLib,
  }),
  computed: {
    ...mapGetters('wallet', [
      'transactions',
      'explorer',
    ]),
  },
  mounted() {
  },
  methods: {
    isPositive(amount) {
      return BN(amount).isPositive();
    },
    explorerLink(id) {
      return walletLib.compileExplorerLink(this.explorer, id, 'transactions/transactionDetails');
    },
  }
}
</script>

<style lang="scss">
.transactions {
  margin-top: 5px;

  .v-subheader {
    height: 30px;
  }

  &__item {
    &__icon {
      margin: 20px 32px 0 0 !important;
    }

    &__actions {
      display: flex;
      flex-direction: column;
      margin: 4px 0 !important;
    }
  }
}
</style>
