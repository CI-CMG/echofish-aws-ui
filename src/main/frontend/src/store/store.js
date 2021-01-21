import Vue from 'vue';
import Vuex from 'vuex';
import * as mapView from '@/store/modules/mapView';
import cruiseView from '@/store/modules/cruiseView';
import app from './modules/appModule';
import datasets from './modules/datasetsModule';
import dataset from './modules/datasetModule';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    mapView,
    cruiseView,
    datasets,
    dataset,
  },
});
