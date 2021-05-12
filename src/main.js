import Vue from 'vue';
import VueClipboards from 'vue-clipboards';
import App from './App.vue';
import {router} from './plugins/router'
import vuetify from './plugins/vuetify';
import snack from './plugins/snack';
import store from './store';
import i18n from './plugins/i18n'
import validation from './plugins/validation'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import {paramRepository} from "@/db/repository/paramRepository";

Vue.config.productionTip = false;
Vue.use(VueClipboards);
Vue.use(snack);
validation.setI18n(i18n);
Vue.use(validation);

async function init() {
  const language = await paramRepository.getParam('language');
  vuetify.framework.lang.current = language;
  i18n.locale = language;
  store.commit('app/setI18n', i18n);
  new Vue({
    store,
    router,
    vuetify,
    i18n,
    render: h => h(App)
  }).$mount('#app');
}

init();
