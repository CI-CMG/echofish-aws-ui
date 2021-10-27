import Vue from 'vue';
import Vuex from 'vuex';
// import vSelect from 'vue-select';
// import 'vue-select/dist/vue-select.css';
import ToggleSwitch from 'vuejs-toggle-switch';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import { Icon } from 'leaflet';
import App from './App.vue';
import router from './router';
import store from './store/store';
import 'cesium/Widgets/widgets.css';
import '@/assets/css/main.scss';

// eslint-disable-next-line no-underscore-dangle
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  // eslint-disable-next-line global-require
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  // eslint-disable-next-line global-require
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  // eslint-disable-next-line global-require
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(Vuex);
Vue.use(ToggleSwitch);
// Vue.component('v-select', vSelect);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
