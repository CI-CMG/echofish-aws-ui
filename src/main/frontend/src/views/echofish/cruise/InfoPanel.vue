<template>
  <div>
    <div style="width: 100%; height: 150px;">
      <CesiumVue
        ref="map"
        :initial-longitude="centerLon || 0"
        :initial-latitude="centerLat || 0"
        :initial-height="20000.0"
        :maximum-zoom-distance="25000000"
        :on-path-click="onPathClick"
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
import * as Cesium from 'cesium/Cesium';
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
    centerLatLon() {
      return {
        latitude: this.centerLat,
        longitude: this.centerLon,
      };
    },
  },
  watch: {
    centerLatLon(latLon) {
      console.log('centerLatLon');
      this.flyTo(latLon);
    },
  },
  methods: {
    ...mapMutations({
      setUseLocalTime: 'cruiseView/useLocalTime',
    }),
    onPathClick() {

    },
    flyTo({ latitude, longitude }) {
      this.$refs.map.getViewer().camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 20000.0),
      });

      if (!this.billboard) {
        this.billboard = this.$refs.map.getViewer().entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            longitude,
            latitude,
          ),
          billboard: {
            image: logoSmall,
            width: 20,
            height: 20,
          },
        });
      } else {
        this.billboard.position = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
        );
      }
    },
  },

};
</script>
