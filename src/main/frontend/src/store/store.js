import Vue from 'vue';
import Vuex from 'vuex';
import * as mapView from '@/store/modules/mapView';
import * as cruiseView from '@/store/modules/cruiseView';
import * as importView from '@/store/modules/importStore';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    mapView,
    cruiseView,
    importView,
  },
});
