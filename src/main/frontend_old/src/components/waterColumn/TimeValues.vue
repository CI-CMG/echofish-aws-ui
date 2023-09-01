<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<template>
    <div class="TimeValues">

      <div id="timeToggleButtons">
        <toggle-switch
          :options="toggleOptions"
          v-model="utcTimeToggle"
        />
      </div>

      <p>Time of Measurement: <b>{{ timestamp }}</b> ({{ dateTime.zoneName }})</p>
      <p>
        Sunrise ☼ <b>{{ dateTime.sunrise }}</b>,
        Sunset ☀ <b>{{ dateTime.sunset }}</b>,
        Moon Phase: <b>{{ dateTime.moonPhase }}</b>
      </p>

    </div>
</template>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<script>

import { mapActions, mapState } from 'vuex';
import tzlookup from 'tz-lookup';
import moment from 'moment-timezone';
import SunCalc from 'suncalc';
import { scaleThreshold } from 'd3-scale';
import store from '@/store/store';

export default {
  name: 'TimeValues',

  data() {
    return {
      utcTimeToggle: 'utc',
      toggleOptions: { // https://github.com/larsmars/vuejs-toggle-switch
        layout: {
          color: '#75737b',
          backgroundColor: '#c8c0d3',
          selectedColor: '#007aff',
          selectedBackgroundColor: 'white',
          borderColor: '#75737b',
          fontFamily: 'Lucida Grande',
          fontWeight: 'normal',
          fontWeightSelected: 'bold',
          squareCorners: true,
        },
        size: {
          height: 1.5, padding: 0.25, fontSize: 0.75,
        },
        items: {
          preSelected: 'utc',
          labels: [{ name: 'utc' }, { name: 'local' }],
        },
      },
    };
  },

  methods: {
    ...mapActions('cruiseView', [
      'updateDateTime',
    ]),
    moonPhaseLookup(value) {
      return scaleThreshold()
        .domain([0.01, 0.25, 0.26, 0.50, 0.51, 0.75, 0.76])
        .range([
          'New Moon 🌑', 'Waxing Crescent 🌒', 'First Quarter 🌓', 'Waxing Gibbous 🌔',
          'Full Moon 🌕', 'Waning Gibbous 🌖', 'Last Quarter 🌗', 'Waning Crescent 🌘',
        ])(value);
    },
    getAstronomical(localTime) {
      const astronomicalTimes = SunCalc.getTimes(
        localTime,
        this.pointer.latitude,
        this.pointer.longitude,
      );
      const sR = new Date(0);
      const sS = new Date(0);
      sR.setUTCSeconds(Date.parse(astronomicalTimes.sunrise.toJSON()) / 1000);
      sS.setUTCSeconds(Date.parse(astronomicalTimes.sunset.toJSON()) / 1000);
      const sunrise = moment(sR, 'YYYY/MM/DD HH:mm:ss ZZ').clone().tz(this.timezone);
      const sunset = moment(sS, 'YYYY/MM/DD HH:mm:ss ZZ').clone().tz(this.timezone);
      const moonIllumination = SunCalc.getMoonIllumination(localTime);
      store.dispatch('cruiseView/updateDateTime', {
        sunrise: sunrise.format().substring(11, 19),
        sunset: sunset.format().substring(11, 19),
        zoneName: sunrise.zoneName(),
        moonPhase: this.moonPhaseLookup(moonIllumination.phase),
      });
    },
  },

  computed: {
    ...mapState('cruiseView', [
      'dateTime',
      'pointer',
    ]),
    timezone() {
      return (this.utcTimeToggle === 'local')
        ? tzlookup(this.pointer.latitude, this.pointer.longitude)
        : 'Etc/UTC';
    },
    timestamp() {
      const tempDate = new Date(0);
      tempDate.setUTCSeconds(this.pointer.timestamp);
      if (this.pointer.timestamp < 1) {
        return null;
      }
      const timestamp = tempDate.toISOString().substring(0, 19);
      const localTime = moment.tz(timestamp, 'Etc/UTC').clone().tz(String(this.timezone));
      this.getAstronomical(localTime);
      return localTime;
    },
  },
};
</script>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped>
  #timeToggleButtons {
    position: absolute;
    top: 10px;
    right: 10px;
  }
</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
