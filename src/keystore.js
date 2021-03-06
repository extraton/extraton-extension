import Vue from 'vue';
import Keystore from './Keystore.vue';
import vuetify from './plugins/vuetify';
import snack from './plugins/snack';
import store from './store';
import i18n from './plugins/i18n'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false
Vue.use(snack);

new Vue({
  store,
  vuetify,
  i18n,
  render: h => h(Keystore)
}).$mount('#app')
