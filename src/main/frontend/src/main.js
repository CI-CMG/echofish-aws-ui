import './resourceBasePath'; // This must be imported first
import Vue from 'vue';
import Vuex from 'vuex';
// import vSelect from 'vue-select';
// import 'vue-select/dist/vue-select.css';
import ToggleSwitch from 'vuejs-toggle-switch';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';
import router from './router';
import store from './store/store';
import 'cesium/Widgets/widgets.css';
import '@/assets/css/main.scss';

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
