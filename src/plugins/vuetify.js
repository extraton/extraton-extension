import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import TonCrystalIcon from "@/components/icons/TonCrystalIcon";
import CoinsIcon from "@/components/icons/CoinsIcon";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#184059',
        secondary: '#5D8AA6',
        // info: '#D7D7D9',
        warning: '#BF7B3F',
        error: '#8c2f1b',
      },
    },
  },
  icons: {
    values: {
      tonCrystal: {
        component: TonCrystalIcon,
      },
      coins: {
        component: CoinsIcon,
      },
    },
  },
});
