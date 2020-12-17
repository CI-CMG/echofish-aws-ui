import Vue from 'vue';
import Router from 'vue-router';
import MapView from '@/views/MapView.vue';
import CruiseView from '@/views/CruiseView.vue';
import ImportView from '@/views/ImportView.vue';
import NProgress from 'nprogress';
import View from './View.vue';

Vue.use(Router);


const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/view',
      component: View,
      children: [
        {
          path: '',
          redirect: { name: 'map-view' },
        },
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
          path: 'import',
          name: 'import-view',
          component: ImportView,
        },
        {
          path: '*',
          redirect: { name: 'map-view' },
        },
      ],
    },
    {
      path: '*',
      redirect: '/view',
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
