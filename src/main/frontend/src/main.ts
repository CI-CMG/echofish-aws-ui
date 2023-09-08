import '@/assets/css/main.scss';
import { createApp } from 'vue';
// import { loadFonts } from '@/plugins/webfontloader';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from 'chart.js';
import App from './App.vue';
import router from './router';
import { store, key } from './store';
import vuetify from './plugins/vuetify';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
);

// loadFonts().then();

createApp(App).use(router).use(store, key).use(vuetify).mount('#app');
