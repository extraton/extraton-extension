import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import HighLevelPage from "@/views/HighLevelPage";
import Start from "@/views/Start";
import Sites from "@/views/site/Sites";
import Wallet from "@/views/wallet/Wallet";
import WalletCreate from "@/views/wallet/Create";
import WalletRestore from "@/views/wallet/Restore";
import BackgroundApi from "@/api/background";
import {setPageTask} from "@/lib/task/items";

Vue.use(VueRouter);

const routes = {
  start: 'start',
  sites: 'sites',
  wallet: 'wallet',
  walletCreate: 'walletCreate',
  walletAdd: 'walletAdd',
  walletRestore: 'walletRestore',
  walletAddRestore: 'walletAddRestore',
};

const list = [
  {
    path: '/',
    component: Start,
    name: routes.start,
  },
  {
    path: '/sites',
    component: Sites,
    name: routes.sites,
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
    ]
  },
]

const router = new VueRouter({routes: list});

router.beforeEach((to, from, next) => {
  if (null !== from.name) {
    BackgroundApi.request(setPageTask, {name: to.name, params: to.params});
  }
  store.commit('globalError/clearText');
  next();
});

export {routes, router}
