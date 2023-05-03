import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/Home/HomeView.vue';
import WaterColumnView from '@/views/WaterColumn/WaterColumnView.vue';
import Map from '@/views/Map/MapView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView,
  },
  {
    path: '/WaterColumnView',
    name: 'WaterColumnView',
    component: WaterColumnView,
  },
  {
    path: '/MapView',
    name: 'MapView',
    component: Map,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
