<template>
  <div>
    <div style="width: 100%; height: 150px;">
      <CesiumVue
        ref="map"
        :longitude="centerLon"
        :latitude="centerLat"
        :height="20000.0"
        :maximum-zoom-distance="25000000"
        :on-path-click="onPathClick"
        :billboard="billboard"
      />
    </div>
    <div>
      <b-form-checkbox v-model="useLocalTime" name="localTime" switch>
        Local Time
      </b-form-checkbox>
      <span>
        <span>Time: {{ selectedDateTime }}</span><span>Lon: {{ selectedLon }}</span><span>Lat: {{ selectedLat }}</span><span>Depth: {{ selectedDepthMeters }}</span>
      </span>
      Sunrise ☼ <b>{{ sunrise }}</b>,
      Sunset ☀ <b>{{ sunset }}</b>,
      Moon Phase: <b>{{ moonPhase }}</b>
    </div>
  </div>
</template>

<script>
import CesiumVue from '@/components/cesium/CesiumVue.vue';
import logoSmall from '@/assets/blue_small.png';
import { mapMutations, mapGetters } from 'vuex';

export default {
  components: {
    CesiumVue,
  },
  computed: {
    ...mapGetters({
      storeUseLocalTime: 'cruiseView/useLocalTime',
      sunrise: 'cruiseView/sunrise',
      sunset: 'cruiseView/sunset',
      moonPhase: 'cruiseView/moonPhase',
      zoneName: 'cruiseView/zoneName',
      selectedLat: 'cruiseView/selectedLat',
      selectedLon: 'cruiseView/selectedLon',
      selectedTimestampMillis: 'cruiseView/selectedTimestampMillis',
      selectedDepthMeters: 'cruiseView/selectedDepthMeters',
      selectedDateTime: 'cruiseView/selectedDateTime',
      centerLat: 'cruiseView/centerLat',
      centerLon: 'cruiseView/centerLon',
    }),
    useLocalTime: {
      get() {
        return this.storeUseLocalTime;
      },
      set(value) {
        this.setUseLocalTime(value);
      },
    },
    billboard() {
      return {
        latitude: this.centerLat,
        longitude: this.centerLon,
        billboard: {
          image: logoSmall,
          width: 20,
          height: 20,
        },
      };
    },
  },
  methods: {
    ...mapMutations({
      setUseLocalTime: 'cruiseView/useLocalTime',
      prepareCruiseView: 'cruiseView/prepareCruiseView',
    }),
    onPathClick({ cruiseName, longitude, latitude }) {
      this.prepareCruiseView({ lat: latitude, lon: longitude, cruise: cruiseName })
        .then(({ storeIndex, frequency, cruise }) => this.$router.push({ name: 'cruise-view', params: { cruise, storeIndex, frequency } }));
    },
  },

};
</script>
