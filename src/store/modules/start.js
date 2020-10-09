import {routes, router} from '@/plugins/router'

export default {
  namespaced: true,
  actions: {
    goToCreateWallet: () => router.push({name: routes.walletCreate}),
    goToRestoreWallet: () => router.push({name: routes.walletRestore}),
  },
}
