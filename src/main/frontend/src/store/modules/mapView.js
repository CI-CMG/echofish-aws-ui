import apiService from '@/services/apiService';

export const namespaced = true;

export const state = {
  latitude: 0,
  longitude: 0,
  cruiseName: '',
  fetching: false,
  viewMetadata: {},
  fetchingGeoJson: false,
  geoJson: {},
  viewRect: {
    west: -180.0,
    south: -90.0,
    east: 180.0,
    north: 90.0,
    height: 200000,
  },
};

export const mutations = {
  UPDATE_VIEW_RECT(_state, viewRect) {
    _state.viewRect = viewRect;
  },
  GEOJSON_REQUEST(_state) {
    _state.fetchingGeoJson = true;
  },
  GEOJSON_SUCCESS(_state, geoJson) {
    _state.fetchingGeoJson = false;
    _state.geoJson = geoJson;
  },
  GEOJSON_FAILURE(_state) {
    _state.fetchingGeoJson = false;
    // TODO handle errors
  },
  METADATA_REQUEST(_state, { latitude, longitude, cruiseName }) {
    _state.fetching = true;
    _state.latitude = latitude;
    _state.longitude = longitude;
    _state.cruiseName = cruiseName;
  },
  METADATA_SUCCESS(_state, viewMetadata) {
    _state.fetching = false;
    _state.viewMetadata = viewMetadata;
  },
  METADATA_FAILURE(_state) {
    _state.fetching = false;
    // TODO handle errors
  },
};

export const actions = {
  updateViewRect({ commit }, viewRect) {
    commit('UPDATE_VIEW_RECT', viewRect);
  },
  getGeoFeatures({ commit }, config) {
    commit('GEOJSON_REQUEST');
    return apiService.getGeoFeatures(config)
      .then((response) => {
        commit('GEOJSON_SUCCESS', response.data);
        return response.data;
      }).catch((error) => {
      // TODO handle errors
        console.log(error);
        commit('GEOJSON_FAILURE');
      });
  },
  getMetadata({ commit }, payload) {
    commit('METADATA_REQUEST', payload);
    return apiService.getViewMetadata(payload)
      .then((response) => {
        commit('METADATA_SUCCESS', response.data);
        return response.data;
      }).catch((error) => {
      // TODO handle errors
        console.log(error);
        commit('METADATA_FAILURE');
        throw error;
      });
  },
};

export const getters = {
  getCruiseName(_state) {
    return _state.cruiseName;
  },
};
