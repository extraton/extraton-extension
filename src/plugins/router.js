import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import HighLevelPage from "@/views/HighLevelPage";
import Start from "@/views/Start";
import Wallet from "@/views/wallet/Wallet";
import WalletCreate from "@/views/wallet/Create";
import WalletRestore from "@/views/wallet/Restore";

Vue.use(VueRouter);

const routes = {
  start: 'start',
  wallet: 'wallet',
  walletCreate: 'walletCreate',
  walletRestore: 'walletRestore',
};

const list = [
  {
    path: '/',
    component: Start,
    name: routes.start,
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
        path: 'restore',
        name: routes.walletRestore,
        component: WalletRestore,
        meta: {back: routes.start}
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
