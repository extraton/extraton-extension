<template>
  <div class="walletToken">
    <v-menu v-model="menu" bottom left offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" style="top:12px" icon small absolute right text tile>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item @click="hideToken(tokenId)">
          <v-list-item-icon>
            <v-icon>mdi-close</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Hide</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <balance :token-id="tokenId" class="walletToken__balance"/>
    <template v-if="isTokenActive(tokenId)">
      <addr v-if="null!==token.walletAddress" :address="token.walletAddress" available-in-explorer/>
      <div class="walletToken__actions">
        <send-token :token-id="tokenId"/>
      </div>
    </template>
    <v-skeleton-loader v-else-if="isTokenDeploying(tokenId)" type="text" width="180" style="margin:auto"/>
    <activate-token v-else :token-id="tokenId"/>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import Balance from "@/components/Balance";
import ActivateToken from "@/components/assets/ActivateToken";
import Addr from "@/components/addr";
import SendToken from "@/components/SendToken";

export default {
  components: {
    ActivateToken,
    Balance,
    Addr,
    SendToken,
  },
  data() {
    return {
      menu: false,
    };
  },
  mounted() {
  },
  computed: {
    ...mapGetters('token', {
      getTokenById: 'token',
      isTokenActive: 'isTokenActive',
      isTokenDeploying: 'isTokenDeploying',
    }),
    tokenId() {
      return this.$route.params.id;
    },
    token() {
      return this.getTokenById(this.tokenId);
    },
  },
  methods: {
    ...mapActions('token', [
      'hideToken'
    ]),
  },
}
</script>

<style lang="scss">
.walletToken {
  &__balance {
    margin: 20px 0 25px 0;
  }

  &__actions {
    margin-top: 25px;
    display: flex;
    justify-content: center;
  }
}
</style>
