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
      <b-form-checkbox v-model="useLocalTime" name="localTime" switch>Local Time</b-form-checkbox>
      <span>
        <span>Time: {{ selectedDateTime }}</span><br />
        <span>Lon: {{ selectedLon }}</span><br />
        <span>Lat: {{ selectedLat }}</span><br />
        <span>Depth: {{ selectedDepthMeters }}</span><br />
      </span>
    </div>
  </div>
</template>

<script>
import CesiumVue from '@/components/cesium/CesiumVue.vue';
import logoSmall from '@/assets/blue_small.png';
import { mapMutations, mapGetters, mapActions } from 'vuex';

export default {
  components: {
    CesiumVue,
  },
  computed: {
    ...mapGetters({
      storeUseLocalTime: 'cruiseView/useLocalTime',
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
    }),
    ...mapActions({
      prepareCruiseView: 'cruiseView/prepareCruiseView',
    }),
    onPathClick({ cruiseName, longitude, latitude }) {
      this.prepareCruiseView({ lat: latitude, lon: longitude, cruise: cruiseName })
        .then(({
          storeIndex, depthIndex, frequency, cruise,
        }) => this.$router.push({
          name: 'cruise-view',
          params: {
            cruise, storeIndex, depthIndex, frequency,
          },
        }).catch((err) => {
          // Ignore the vuex err regarding  navigating to the page they are already on.
          if (
            err.name !== 'NavigationDuplicated'
            && !err.message.includes('Avoided redundant navigation to current location')
          ) {
            throw err;
          }
        }));
    },
  },

};
</script>
