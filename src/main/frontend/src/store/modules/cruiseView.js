import moment from 'moment-timezone';
import tzlookup from 'tz-lookup';
import Geohash from 'latlon-geohash';
import { openArray, slice } from 'zarr';
import { colorPalettes, defaultColorPalette } from '../../views/echofish/cruise/WaterColumnColors';
import geoHashApi from '../../api/geoHashApi';
import { ZARR_BASE_PATH } from '../../basePath';

const getTimezone = (local, lat, lon) => {
  if (local) {
    if (lat != null && lon != null) {
      return tzlookup(lat, lon);
    }
    return '';
  }
  return 'Etc/UTC';
};

const getDateTime = (epochMillis, timezone) => {
  if (epochMillis == null || !timezone) {
    return '';
  }
  const tempDate = new Date(0);
  tempDate.setUTCMilliseconds(epochMillis * 1000);
  const timestamp = tempDate.toISOString().substring(0, 19);
  const localTime = moment.tz(timestamp, 'Etc/UTC').clone().tz(`${timezone}`);
  return localTime;
};

const estimateDistance = (lon1, lat1, lon2, lat2) => Math.sqrt(
  (lon2 - lon1) ** 2 + (lat2 - lat1) ** 2,
);

const findNearestIndex = (lon, lat, geoHashList) => {
  let minDistance = null;
  let minIndex = -1;
  for (let i = 0; i < geoHashList.length; i += 1) {
    const [index, lon2, lat2] = geoHashList[i];
    const distance = estimateDistance(lon, lat, lon2, lat2);
    if (minDistance == null || distance < minDistance) {
      minDistance = distance;
      minIndex = index;
    }
  }
  return minIndex;
};

const updateTimeFields = (state, lat, lon, epochMillis, depthMeters, useLocalTime) => {
  state.selectedLat = lat;
  state.selectedLon = lon;
  state.selectedTimestampMillis = epochMillis;
  state.selectedDepthMeters = depthMeters;
  state.selectedTimezone = getTimezone(useLocalTime, lat, lon);
  state.selectedDateTime = getDateTime(epochMillis, state.selectedTimezone);
};

const defaultState = (state = {}) => {
  state.loading = false;
  state.cruise = '';
  state.selectedFrequency = -1;
  state.selectedFrequencyIndex = -1;
  state.frequencies = [];
  state.sliderValues = [-90, -40];
  state.colorPalettes = colorPalettes;
  state.selectedColorPalette = defaultColorPalette;
  state.colorValueArray = null;
  state.useLocalTime = false;
  state.zoneName = '';
  state.selectedLat = null;
  state.selectedLon = null;
  state.selectedTimestampMillis = null;
  state.selectedDepthMeters = null;
  state.selectedDateTime = '';
  state.selectedTimezone = '';
  state.centerLat = 0;
  state.centerLon = 0;
  state.center = [];
  state.zoom = 0;
  state.geoHash = '';
  state.storeIndex = -1;
  state.zarr = {};
  state.maxBounds = [[0, 0], [0, 0]];
  return state;
};

export default {
  namespaced: true,

  state: defaultState(),

  getters: {
    maxBounds(state) {
      return state.maxBounds;
    },
    loading(state) {
      return state.loading;
    },
    zarr(state) {
      return state.zarr;
    },
    cruise(state) {
      return state.cruise;
    },
    geoHash(state) {
      return state.geoHash;
    },
    storeIndex(state) {
      return state.storeIndex;
    },
    selectedFrequency(state) {
      return state.selectedFrequency;
    },
    frequencies(state) {
      return state.frequencies;
    },
    sliderValues(state) {
      return state.sliderValues;
    },
    colorPalettes(state) {
      return state.colorPalettes;
    },
    selectedColorPalette(state) {
      return state.selectedColorPalette;
    },
    colorValueArray(state) {
      return state.colorValueArray;
    },
    useLocalTime(state) {
      return state.useLocalTime;
    },
    zoneName(state) {
      return state.zoneName;
    },
    selectedLat(state) {
      return state.selectedLat;
    },
    selectedLon(state) {
      return state.selectedLon;
    },
    selectedTimestampMillis(state) {
      return state.selectedTimestampMillis;
    },
    selectedDepthMeters(state) {
      return state.selectedDepthMeters;
    },
    selectedDateTime(state) {
      return state.selectedDateTime;
    },
    selectedTimezone(state) {
      return state.selectedTimezone;
    },
    centerLat(state) {
      return state.centerLat;
    },
    centerLon(state) {
      return state.centerLon;
    },
    // centerTimestampMillis(state) {
    //   return state.centerTimestampMillis;
    // },
    center(state) {
      return state.center;
    },
    zoom(state) {
      return state.zoom;
    },
  },

  mutations: {
    maxBounds(state, maxBounds) {
      state.maxBounds = maxBounds;
    },
    loading(state, loading) {
      state.loading = loading;
    },
    zarr(state, zarr) {
      state.zarr = zarr;
    },
    cruise(state, cruise) {
      state.cruise = cruise;
    },
    geoHash(state, geoHash) {
      state.geoHash = geoHash;
    },
    storeIndex(state, storeIndex) {
      state.storeIndex = storeIndex;
    },
    reset(state) {
      defaultState(state);
    },
    selectedFrequency(state, selectedFrequency) {
      state.selectedFrequency = selectedFrequency;
    },
    frequencies(state, frequencies) {
      state.frequencies = frequencies;
    },
    sliderValues(state, sliderValues) {
      state.sliderValues = sliderValues;
    },
    selectedColorPalette(state, selectedColorPalette) {
      state.selectedColorPalette = selectedColorPalette;
    },
    colorValueArray(state, colorValueArray) {
      state.colorValueArray = colorValueArray;
    },
    useLocalTime(state, useLocalTime) {
      state.useLocalTime = useLocalTime;
      updateTimeFields(state, state.selectedLat, state.selectedLon, state.selectedTimestampMillis,
        state.selectedDepthMeters, state.useLocalTime);
    },
    onMoveEchogram(state, { lat, lon, epochMillis }) {
      state.centerLat = lat;
      state.centerLon = lon;
      state.centerTimestampMillis = epochMillis;
    },
    onSelectPoint(state, {
      lat, lon, epochMillis, depthMeters,
    }) {
      updateTimeFields(state, lat, lon, epochMillis, depthMeters, state.useLocalTime);
    },
    center(state, center) {
      state.center = center;
    },
    zoom(state, zoom) {
      state.zoom = zoom;
    },
    centerLat(state, centerLat) {
      state.centerLat = centerLat;
    },
    centerLon(state, centerLon) {
      state.centerLon = centerLon;
    },
    selectedLon(state, selectedLon) {
      state.selectedLon = selectedLon;
    },
    selectedLat(state, selectedLat) {
      state.selectedLat = selectedLat;
    },
    selectedTimestampMillis(state, selectedTimestampMillis) {
      state.selectedTimestampMillis = selectedTimestampMillis;
    },
    selectedDepthMeters(state, selectedDepthMeters) {
      state.selectedDepthMeters = selectedDepthMeters;
    },
  },

  actions: {
    prepareCruiseView({ commit, dispatch, state }, {
      lat, lon, cruise, storeIndex, frequency,
    }) {
      console.log(Date.now());
      commit('loading', true);
      if (cruise !== state.cruise) {
        commit('cruise', cruise);
      }
      if (frequency != null && frequency !== state.frequency) {
        commit('selectedFrequency', frequency);
      }

      let zarrPromise;
      if (cruise === state.zarr.cruise) {
        zarrPromise = Promise.resolve(state.zarr);
      } else {
        const url = `${ZARR_BASE_PATH}/${cruise}_resample.zarr`; // TODO: switch back from resample

        const frequencyPromise = openArray({ store: url, path: 'frequency', mode: 'r' })
          .then((frequencyArray) => frequencyArray.get(null).then(({ data }) => {
            const frequencies = Array.from(data);
            commit('frequencies', frequencies);
            if (frequency == null) {
              commit('selectedFrequency', frequencies.length ? frequencies[0] : -1);
            }
            return frequencyArray;
          },
          (error) => {
            dispatch('app/addErrors', ['unable to load frequencies data'], { root: true });
            throw error;
          }));
        const dataPromise = openArray({ store: url, path: 'data', mode: 'r' });
        const timePromise = openArray({ store: url, path: 'time', mode: 'r' });
        const latitudePromise = openArray({ store: url, path: 'latitude', mode: 'r' });
        const longitudePromise = openArray({ store: url, path: 'longitude', mode: 'r' });

        zarrPromise = Promise.all([
          dataPromise,
          timePromise,
          frequencyPromise,
          latitudePromise,
          longitudePromise,
        ]).then(([dataArray, timeArray, frequencyArray, latitudeArray, longitudeArray]) => {
          const zarr = {
            cruise, dataArray, timeArray, frequencyArray, latitudeArray, longitudeArray,
          };
          commit('maxBounds', [[-1 * dataArray.shape[0], 0], [0, dataArray.shape[1]]]);
          commit('zarr', zarr);
          return zarr;
        },
        (error) => {
          dispatch('app/addErrors', ['unable to load echogram data'], { root: true });
          throw error;
        });
      }

      let storeIndexPromise;
      if (storeIndex != null && storeIndex > -1) {
        storeIndexPromise = Promise.resolve(storeIndex);
      } else {
        const geoHash = Geohash.encode(lat, lon, 5);
        storeIndexPromise = geoHashApi.get(`/${cruise}/${geoHash}.json`).then(({ data }) => findNearestIndex(lon, lat, data));
      }

      return Promise.all([zarrPromise, storeIndexPromise])
        .then(([zarr, index]) => {
          commit('zarr', zarr);
          commit('storeIndex', index);
          commit('center', [-1, index]);
          return Promise.all([zarr.latitudeArray.get([index]), zarr.longitudeArray.get([index])])
            .then(([latA, lonA]) => {
              commit('centerLat', latA);
              commit('centerLon', lonA);
            },
            (error) => {
              dispatch('app/addErrors', ['unable to load location data'], { root: true });
              throw error;
            });
        })
        .then(() => {
          commit('loading', false);
          return {
            storeIndex: state.storeIndex,
            frequency: state.selectedFrequency,
            cruise: state.cruise,
          };
        }, (e) => {
          commit('loading', false);
          throw e;
        });
    },

    // when user clicks on map, update the cursor values in dashboard
    updateCursorValues({ commit, state }, {
      storeIndex, depthMeters,
    }) {
      console.log(Date.now());
      const timestamp = state.zarr.timeArray.get(slice(storeIndex, storeIndex + 1)).then((z) => Array.from(z.data)[0]);
      const latitude = state.zarr.latitudeArray.get(slice(storeIndex, storeIndex + 1)).then((z) => Array.from(z.data)[0].toFixed(5));
      const longitude = state.zarr.longitudeArray.get(slice(storeIndex, storeIndex + 1)).then((z) => Array.from(z.data)[0].toFixed(5));

      Promise.all([timestamp, latitude, longitude])
        .then((x) => {
          // ({time: x[0], lat: x[1], lon: x[2]})
          commit('selectedTimestampMillis', x[0]);
          commit('selectedLat', x[1]);
          commit('selectedLon', x[2]);
          commit('selectedDepthMeters', depthMeters);
        });
    },
  },
};
