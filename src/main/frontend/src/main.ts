import '@/assets/css/main.scss';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { store, key } from './store';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';

loadFonts().then();

createApp(App).use(router).use(store, key).use(vuetify).mount('#app');
