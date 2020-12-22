import Vue from 'vue';
import Router from 'vue-router';
import MapView from '@/views/MapView.vue';
import CruiseView from '@/views/CruiseView.vue';
import NProgress from 'nprogress';
import Admin from '@/views/admin/Admin.vue';
import Echofish from '@/views/echofish/Echofish.vue';
import Datasets from '@/views/admin/Datasets.vue';
import View from './View.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/view',
      component: View,
      name: 'View',
      redirect: { name: 'Echofish' },
      children: [
        {
          path: 'admin',
          component: Admin,
          name: 'Admin',
          redirect: { name: 'Datasets' },
          children: [
            {
              path: 'datasets',
              name: 'Datasets',
              component: Datasets,
            },
          ],
        },
        {
          path: 'echofish',
          component: Echofish,
          name: 'Echofish',
          redirect: { name: 'map-view' },
          children: [
            {
              path: 'map',
              name: 'map-view',
              component: MapView,
            },
            {
              // path: 'cruise/:cruiseName',
              path: 'cruise',
              name: 'cruise-view',
              component: CruiseView,
            },
            {
              path: '*',
              redirect: { name: 'map-view' },
            },
          ],
        },
      ],
    },
    {
      path: '*',
      redirect: { name: 'Echofish' },
    },
  ],
});

router.beforeEach((routeTo, routeFrom, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
