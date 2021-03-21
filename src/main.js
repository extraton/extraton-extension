import Vue from 'vue';
import VueClipboards from 'vue-clipboards';
import App from './App.vue';
import {router} from './plugins/router'
import vuetify from './plugins/vuetify';
import snack from './plugins/snack';
import store from './store';
import i18n from './plugins/i18n'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false;
Vue.use(VueClipboards);
Vue.use(snack);

new Vue({
  store,
  router,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
