import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import HighLevelPage from "@/views/HighLevelPage";
import Start from "@/views/Start";
import Settings from "@/views/Settings";
import Wallet from "@/views/wallet/Wallet";
import WalletCreate from "@/views/wallet/Create";
import WalletRestore from "@/views/wallet/Restore";
import WalletToken from "@/views/wallet/Token";

Vue.use(VueRouter);

const routes = {
  start: 'start',
  settings: 'settings',
  wallet: 'wallet',
  walletCreate: 'walletCreate',
  walletAdd: 'walletAdd',
  walletRestore: 'walletRestore',
  walletAddRestore: 'walletAddRestore',
  walletToken: 'walletToken',
};

const list = [
  {
    path: '/',
    component: Start,
    name: routes.start,
  },
  {
    path: '/settings',
    component: Settings,
    name: routes.settings,
    meta: {back: routes.wallet}
  },
  {
    path: '/wallet',
    component: HighLevelPage,
    children: [
      {
        path: '',
        name: routes.wallet,
        component: Wallet
      },
      {
        path: 'create',
        name: routes.walletCreate,
        component: WalletCreate,
        meta: {back: routes.start}
      },
      {
        path: 'add',
        name: routes.walletAdd,
        component: WalletCreate,
        meta: {back: routes.wallet}
      },
      {
        path: 'restore',
        name: routes.walletRestore,
        component: WalletRestore,
        meta: {back: routes.start}
      },
      {
        path: 'add-restore',
        name: routes.walletAddRestore,
        component: WalletRestore,
        meta: {back: routes.wallet}
      },
      {
        path: 'token/:id',
        name: routes.walletToken,
        component: WalletToken,
        meta: {back: routes.wallet}
      },
    ]
  },
]

const router = new VueRouter({routes: list})


router.beforeEach((to, from, next) => {
  store.commit('globalError/clearText');
  next();
});

export {routes, router}
