import Vue from 'vue'
import Vuex from 'vuex'
import action from './modules/action'
import app from './modules/app'
import start from './modules/start'
import wallet from './modules/wallet/wallet'
import walletCreate from './modules/wallet/create'
import walletRestore from './modules/wallet/restore'
import globalError from './modules/globalError'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        action,
        app,
        start,
        wallet,
        walletCreate,
        walletRestore,
        globalError,
    }
})
