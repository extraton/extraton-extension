import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import start from './modules/start'
import keys from './modules/keys'
import wallet from './modules/wallet'
import globalError from './modules/globalError'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        app,
        start,
        keys,
        wallet,
        globalError,
    }
})
