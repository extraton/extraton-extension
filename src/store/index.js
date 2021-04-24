import Vue from 'vue'
import Vuex from 'vuex'
import action from './modules/action'
import password from './modules/wallet/password'
import app from './modules/app'
import settings from './modules/settings'
import wallet from './modules/wallet/wallet'
import walletCreate from './modules/wallet/create'
import walletRestore from './modules/wallet/restore'
import walletEdit from './modules/wallet/edit'
import globalError from './modules/globalError'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        action,
        password,
        app,
        settings,
        wallet,
        walletCreate,
        walletRestore,
        walletEdit,
        globalError,
    }
})
