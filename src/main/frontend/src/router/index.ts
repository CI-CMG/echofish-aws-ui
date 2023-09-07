import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { RAW_BASE_PATH } from '@/resourceBasePath';
import EchofishView from '@/views/view/echofish/EchofishView.vue';
import CruiseView from '@/views/view/echofish/cruise/CruiseView.vue';
import MapView from '@/views/view/echofish/map/MapView.vue';
import View from '../views/view/View.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/view',
    name: 'view',
    component: View,
    redirect: { name: 'echofish' },
    children: [
      {
        path: 'echofish',
        name: 'echofish',
        component: EchofishView,
        redirect: { name: 'map' },
        children: [
          {
            path: 'cruise/:shipName/:cruiseName/:sensorName/:storeIndex/:depthIndex/:frequency',
            name: 'cruise',
            component: CruiseView,
          },
          {
            path: 'map',
            name: 'map',
            component: MapView,
          },
        ],
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'view' } },
];

const router = createRouter({
  history: createWebHistory(RAW_BASE_PATH),
  routes,
});

export default router;
