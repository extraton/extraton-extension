import Vue from 'vue';
import VueClipboards from "vue-clipboards";
import App from './App.vue';
import {router} from './plugins/router'
import vuetify from './plugins/vuetify';
import snack from './plugins/snack';
import store from './store';

Vue.config.productionTip = false
Vue.use(VueClipboards);
Vue.use(snack);

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
