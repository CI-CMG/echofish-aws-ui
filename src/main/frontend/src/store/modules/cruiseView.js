// import apiService from '@/services/apiService';
import { colorPalettes } from '@/views/WaterColumnColors';
import { getField, updateField } from 'vuex-map-fields';

export const namespaced = true;

export const state = {
  targetLocation: {},
  frequencyKHz: '18',
  frequencies: [18, 38, 120, 200],
  cruiseName: 'GU1002',
  frequency: 18,
  sliderValues: [-80, -35], // initial min-max of dB slider
  colorPalettes,
  selectedPalette: 'viridis',
  colorValueArray: null,
  colorScaleFunction: null,
  depthScale: 1.0,
  pointer: { // values associated with mouse interaction
    x: 10,
    y: 20,
    timestamp: null,
    latitude: 123.45,
    longitude: 67.89,
    depth: 120,
  },
  lastPixelColor: null,
  dateTime: { // astronomical parameters
    sunrise: null,
    sunset: null,
    zoneName: null,
    moonPhase: null,
  },
};

export const mutations = {
  UPDATE_LOCATION(_state, loc) {
    _state.targetLocation = loc;
  },
  UPDATE_FREQUENCY(_state, freq) {
    _state.frequency = freq;
    _state.frequencyKHz = freq;
  },
  UPDATE_FREQUENCIES(_state, freqs) {
    _state.frequencies = freqs;
  },
  UPDATE_CRUISE_NAME(_state, cruiseName) {
    _state.cruiseName = cruiseName;
  },
  UPDATE_SLIDER_VALUES(_state, values) {
    _state.sliderValues = values;
  },
  UPDATE_SELECTED_PALETTE(_state, palette) {
    _state.selectedPalette = palette;
  },
  UPDATE_DATE_TIME(_state, value) {
    _state.dateTime = value;
  },
  UPDATE_COLOR_SCALE_FUNCTION(_state, fun) {
    _state.colorScaleFunction = fun;
  },
  UPDATE_COLOR_VALUE_ARRAY(_state, arr) {
    _state.colorValueArray = arr;
  },
  UPDATE_POINTER_VALUES(_state, values) {
    _state.pointer.x = values.x;
    _state.pointer.y = values.y;
    _state.pointer.timestamp = values.timestamp;
    _state.pointer.latitude = values.latitude;
    _state.pointer.longitude = values.longitude;
    _state.pointer.depth = values.depth;
  },
  UPDATE_LAST_PIXEL_COLOR_VALUE(_state, value) {
    _state.lastPixelColor = value;
  },
  updateField,
};

export const actions = {
  updateTargetLocation({ commit }, loc) {
    commit('UPDATE_LOCATION', loc);
  },
  updateFrequencies({ commit }, freqs) {
    commit('UPDATE_FREQUENCIES', freqs);
  },
  updateFrequency({ commit }, freq) {
    commit('UPDATE_FREQUENCY', freq);
  },
  updateCruiseName({ commit }, cruiseName) {
    commit('UPDATE_CRUISE_NAME', cruiseName);
  },
  updateSliderValues: ({ commit }, values) => {
    commit('UPDATE_SLIDER_VALUES', values);
  },
  updateSelectedPalette: ({ commit }, palette) => {
    commit('UPDATE_SELECTED_PALETTE', palette);
  },
  updateDateTime: ({ commit }, payload) => {
    commit('UPDATE_DATE_TIME', payload);
  },
  updateColorScaleFunction: ({ commit }, fun) => {
    commit('UPDATE_COLOR_SCALE_FUNCTION', fun);
  },
  updateColorValueArray: ({ commit }, arr) => {
    commit('UPDATE_COLOR_VALUE_ARRAY', arr);
  },
  updatePointerValues: ({ commit }, values) => {
    commit('UPDATE_POINTER_VALUES', values);
  },
  updateLastPixelColorValue: ({ commit }, value) => {
    commit('UPDATE_LAST_PIXEL_COLOR_VALUE', value);
  },
};

export const getters = {
  getField,
};
