import SunCalc from 'suncalc';
import moment from 'moment-timezone';
import { scaleThreshold } from 'd3-scale';
import tzlookup from 'tz-lookup';
import Geohash from 'latlon-geohash';
import { openArray } from 'zarr';
import { defaultColorPalette } from '../../views/echofish/cruise/WaterColumnColors';
import geoHashApi from '../../api/geoHashApi';
import { ZARR_BASE_PATH } from '../../basePath';

const moonPhaseLookup = (value) => scaleThreshold()
  .domain([0.01, 0.25, 0.26, 0.50, 0.51, 0.75, 0.76])
  .range([
    'New Moon 🌑', 'Waxing Crescent 🌒', 'First Quarter 🌓', 'Waxing Gibbous 🌔',
    'Full Moon 🌕', 'Waning Gibbous 🌖', 'Last Quarter 🌗', 'Waning Crescent 🌘',
  ])(value);

const getAstronomical = (localTime, lat, lon, timezone) => {
  if (!localTime || !lat || !lon || !timezone) {
    return {
      sunrise: '',
      sunset: '',
      zoneName: '',
      moonPhase: '',
    };
  }

  const astronomicalTimes = SunCalc.getTimes(
    localTime,
    lat,
    lon,
  );
  const sR = new Date(0);
  const sS = new Date(0);
  sR.setUTCSeconds(Date.parse(astronomicalTimes.sunrise.toJSON()) / 1000);
  sS.setUTCSeconds(Date.parse(astronomicalTimes.sunset.toJSON()) / 1000);
  const sunrise = moment(sR, 'YYYY/MM/DD HH:mm:ss ZZ').clone().tz(timezone);
  const sunset = moment(sS, 'YYYY/MM/DD HH:mm:ss ZZ').clone().tz(timezone);
  const moonIllumination = SunCalc.getMoonIllumination(localTime);
  return {
    sunrise: sunrise.format().substring(11, 19),
    sunset: sunset.format().substring(11, 19),
    zoneName: sunrise.zoneName(),
    moonPhase: moonPhaseLookup(moonIllumination.phase),
  };
};

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
  tempDate.setUTCMilliseconds(epochMillis);
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
  const {
    sunrise,
    sunset,
    zoneName,
    moonPhase,
  } = getAstronomical(state.selectedDateTime, lat, lon, state.selectedTimezone);
  state.sunrise = sunrise;
  state.sunset = sunset;
  state.zoneName = zoneName;
  state.moonPhase = moonPhase;
};

const defaultState = (state = {}) => {
  state.loading = false;
  state.cruise = '';
  state.selectedFrequency = -1;
  state.selectedFrequencyIndex = -1;
  state.frequencies = [];
  state.sliderValues = [-80, -35];
  state.selectedColorPalette = defaultColorPalette;
  state.useLocalTime = false;
  state.sunrise = '';
  state.sunset = '';
  state.moonPhase = '';
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
  state.depthIndex = -1;
  state.storeIndex = -1;
  state.zarr = {};
  state.maxBounds = [[0, 0], [0, 0]];
  return state;
};

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    depthIndex(state) {
      return state.depthIndex;
    },
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
    selectedColorPalette(state) {
      return state.selectedColorPalette;
    },
    useLocalTime(state) {
      return state.useLocalTime;
    },
    sunrise(state) {
      return state.sunrise;
    },
    sunset(state) {
      return state.sunset;
    },
    moonPhase(state) {
      return state.moonPhase;
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
    depthIndex(state, depthIndex) {
      state.depthIndex = depthIndex;
    },
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
    useLocalTime(state, useLocalTime) {
      state.useLocalTime = useLocalTime;
      updateTimeFields(state, state.selectedLat, state.selectedLon, state.selectedTimestampMillis,
        state.selectedDepthMeters, state.useLocalTime);
    },
    // onMoveEchogram(state, { lat, lon, epochMillis }) {
    //   state.centerLat = lat;
    //   state.centerLon = lon;
    //   state.centerTimestampMillis = epochMillis;
    // },
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
  },
  actions: {
    prepareCruiseView({ commit, dispatch, state }, {
      lat, lon, cruise, storeIndex, depthIndex, frequency,
    }) {
      // lat, lon only set from map
      // storeIndex is only set from echogram
      // frequency may be null

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
        const url = `${ZARR_BASE_PATH}/${cruise}.zarr`;

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
          let di;
          if (depthIndex == null || depthIndex < 0) {
            di = 0;
          } else {
            di = depthIndex;
          }
          if (di !== state.depthIndex) {
            commit('depthIndex', di);
          }
          commit('storeIndex', index);
          commit('center', [-1 * di, index]);
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
            depthIndex: state.depthIndex,
            frequency: state.selectedFrequency,
            cruise: state.cruise,
          };
        }, (e) => {
          commit('loading', false);
          throw e;
        });
    },
  },
};
