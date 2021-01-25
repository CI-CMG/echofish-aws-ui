import SunCalc from 'suncalc';
import moment from 'moment-timezone';
import { scaleThreshold } from 'd3-scale';
import tzlookup from 'tz-lookup';
import Geohash from 'latlon-geohash';
import { defaultColorPalette } from '../../views/echofish/cruise/WaterColumnColors';
import geoHashApi from '../../api/geoHashApi';

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

// TODO call zarr API and return promise
// eslint-disable-next-line no-unused-vars
const getFrequencies = (cruise) => Promise.resolve([18000, 38000, 120000, 200000]);

// TODO call zarr API and return promise
// eslint-disable-next-line no-unused-vars
const getCenterLatLon = (cruise, storeIndex) => Promise.resolve({
  lat: Math.floor(Math.random() * 181) - 90,
  lon: Math.floor(Math.random() * 361) - 180,
});

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
  state.cruise = '';
  state.selectedFrequency = -1;
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
  // state.centerTimestampMillis = null;
  state.center = [-250, 6000];
  state.zoom = 0;
  state.geoHash = '';
  state.storeIndex = -1;
  return state;
};

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
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
    prepareCruiseView({ commit }, c) {
      // { lat, lon, cruise, storeIndex, frequency}

      return Promise.resolve(c)
        .then((context) => {
          commit('cruise', context.cruise);
          return context;
        })
        .then((context) => {
          if (context.storeIndex != null && context.storeIndex > -1) {
            commit('storeIndex', context.storeIndex);
            return context;
          }
          const geoHash = Geohash.encode(context.lat, context.lon, 5);
          return geoHashApi.get(`/${context.cruise}/${geoHash}.json`)
            .then(({ data }) => {
              const storeIndex = findNearestIndex(context.lon, context.lat, data);
              commit('storeIndex', storeIndex);
              context.storeIndex = storeIndex;
              return context;
            },
            () => {
            // TODO check neighbors?
              commit('storeIndex', -1);
            });
        })
        .then((context) => {
          // TODO optimize this.  Frequencies do not need to be retreived every time.
          console.log(context);
          return getFrequencies().then((frequencies) => {
            commit('frequencies', frequencies);
            const frequency = frequencies[0];
            commit('selectedFrequency', frequency);
            context.frequency = frequency;
            return context;
          });
        })
        .then((context) => getCenterLatLon(context.cruise, context.storeIndex)
          .then(({ lat, lon }) => {
            commit('centerLat', lat);
            commit('centerLon', lon);
            return context;
          }));
    },
    // updateStoreIndex({ commit }, {
    //   lat, lon, cruise, storeIndex,
    // }) {
    //   commit('cruise', cruise);
    //   const geoHash = Geohash.encode(lat, lon, 5);
    //   commit('geoHash', geoHash);
    //   if (storeIndex && storeIndex >= 0) {
    //     commit('storeIndex', storeIndex);
    //   } else {
    //     geoHashApi.get(`/${cruise}/${geoHash}.json`).then(({ data }) => {
    //       commit('storeIndex', findNearestIndex(lon, lat, data));
    //     },
    //     () => {
    //       // TODO check neighbors?
    //       commit('storeIndex', -1);
    //     });
    //   }
    // },
  },
};
