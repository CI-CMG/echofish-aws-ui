import SunCalc from 'suncalc';
import moment from 'moment-timezone';
import { scaleThreshold } from 'd3-scale';
import tzlookup from 'tz-lookup';
import { defaultColorPalette } from '../../views/echofish/cruise/WaterColumnColors';

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
  state.selectedFrequency = '18 kHz';
  state.frequencies = ['18 kHz', '38 kHz', '120 kHz', '200 kHz'];
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
  state.centerTimestampMillis = null;
  state.center = [-250, 6000];
  state.zoom = 0;
  return state;
};

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
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
    centerTimestampMillis(state) {
      return state.centerTimestampMillis;
    },
    center(state) {
      return state.center;
    },
    zoom(state) {
      return state.zoom;
    },
  },
  mutations: {
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
      updateTimeFields(state, state.selectedLat, state.selectedLon, state.selectedTimestampMillis, state.selectedDepthMeters, state.useLocalTime);
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
  },
  actions: {

  },
};
