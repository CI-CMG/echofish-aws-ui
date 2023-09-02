import '@/assets/css/main.scss';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { store, key } from './store';
import vuetify from './plugins/vuetify';

createApp(App).use(router).use(store, key).use(vuetify).mount('#app');
