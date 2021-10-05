<template>
  <v-menu v-model="menu" bottom left offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" icon tile>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item-group v-if="null !== walletKey" v-model="walletKey" @change="changeWallet" mandatory>
        <v-list-item v-for="(item, id) in wallets" :key="id" two-line>
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-overline">{{ walletLib.addressToView(item.address) }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click.stop="startEditing({wallets, wallet: item})" icon>
              <v-icon small>mdi-cog</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
      <v-list-item>
        <v-list-item-content style="padding:2px">
          <div class="text-center">
            <add-wallet-dialog @open="menu=false"/>
          </div>
        </v-list-item-content>
      </v-list-item>

      <v-divider/>

      <v-list-item :to="{name:routes.settings}">
        <v-list-item-icon>
          <v-icon>mdi-cogs</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item :to="{name:routes.sites}">
        <v-list-item-icon>
          <v-icon>mdi-shield-key</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Site permissions</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item href="http://extraton.io" target="_blank">
        <v-list-item-icon>
          <v-icon>mdi-information</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Website</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider/>

      <v-list-item @click="logout">
        <v-list-item-icon>
          <v-icon>mdi-exit-run</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import {mapActions, mapState, mapMutations} from "vuex";
import walletLib from "@/lib/wallet";
import AddWalletDialog from "@/components/AddWalletDialog";
import {routes} from "@/plugins/router";

export default {
  components: {AddWalletDialog},
  data: () => ({
    menu: false,
    walletKey: null,
    walletLib,
    routes,
  }),
  computed: {
    ...mapState('wallet', [
      'wallets',
      'walletId',
    ]),
  },
  watch: {
    walletId(val) {
      if (null !== val) {
        this.setWalletModel();
      }
    },
  },
  mounted() {
    this.setWalletModel();
  },
  methods: {
    ...mapMutations('walletEdit', [
      'startEditing',
    ]),
    ...mapActions('wallet', [
      'changeWallet',
      'logout',
    ]),
    setWalletModel() {
      let i = -1;
      // eslint-disable-next-line no-unused-vars
      for (const [id, wallet] of Object.entries(this.wallets)) {
        i++;
        if (id - 0 === this.walletId) {
          this.walletKey = i;
        }
      }
    },
  },
}
</script>

<style lang="scss">
</style>
