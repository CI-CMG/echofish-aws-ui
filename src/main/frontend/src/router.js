import Vue from 'vue';
import Router from 'vue-router';
import MapView from '@/views/MapView.vue';
import CruiseView from '@/views/CruiseView.vue';
import NProgress from 'nprogress';
import Admin from '@/views/admin/Admin.vue';
import Echofish from '@/views/echofish/Echofish.vue';
import Datasets from '@/views/admin/dataset/Datasets.vue';
import DatasetList from '@/views/admin/dataset/list/DatasetList.vue';
import DatasetDetail from '@/views/admin/dataset/detail/DatasetDetail.vue';
import { register } from '@/apiMiddleware';
import View from './View.vue';

Vue.use(Router);

const routes = [
  {
    path: '/view',
    component: View,
    name: 'View',
    redirect: { name: 'EchoFish' },
    children: [
      {
        path: 'echofish',
        component: Echofish,
        name: 'EchoFish',
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
            redirect: { name: 'EchoFish' },
          },
        ],
      },
      {
        path: 'admin',
        component: Admin,
        name: 'Admin',
        redirect: { name: 'Datasets' },
        children: [
          {
            path: 'dataset',
            name: 'Datasets',
            component: Datasets,
            redirect: { name: 'DatasetList' },
            children: [
              {
                path: 'list',
                name: 'DatasetList',
                component: DatasetList,
              },
              {
                path: 'detail/:platform/:survey/:instrument',
                name: 'DatasetDetail',
                component: DatasetDetail,
                props: true,
              },
              {
                path: '*',
                redirect: { name: 'Datasets' },
              },
            ],
          },
          {
            path: '*',
            redirect: { name: 'Admin' },
          },
        ],
      },
      {
        path: '*',
        redirect: { name: 'View' },
      },
    ],
  },
  {
    path: '*',
    redirect: { name: 'View' },
  },
];

const router = new Router({
  mode: 'history',
  routes,
  linkActiveClass: 'active',
});

register(router);

router.beforeEach((routeTo, routeFrom, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
