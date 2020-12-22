<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<template>
  <div class="cruiseView">
    <l-map
      ref="map"
      :crs="crs"
      :zoom="zoom"
      :minZoom="minZoom"
      :maxZoom="maxZoom"
      :maxBounds="maxBounds"
      :center="center"
      @click="addMarker"
    >
      <l-tile-layer
        :url="url"
      />
      <l-control-scale position="bottomleft" :imperial="false" :metric="true"></l-control-scale>
    </l-map>
    <div id='coordinatesValue'><p>{{ coordinatesValue }}</p></div>

    <div class="mapscroll" ref="cs" />

    <div id="mapWrapper">
      <cesium-vue
        ref="map"
        :initial-longitude="67.89"
        :initial-latitude="123.45"
        :initial-height="20000.0"
        :maximum-zoom-distance="25000000"
        :geo-json="geoJson"
        :cruise-name="cruiseName"
        :on-path-click="onPathClick"
      />
    </div>

    <WaterColumnDashboard />

  </div>
</template>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<script>

import Cesium from 'cesium/Cesium';
import CesiumVue from '@/components/cesium/CesiumVue.vue';
import { mapState, mapActions } from 'vuex';
import logoSmall from '@/assets/blue_small.png';
import store from '@/store/store';
import WaterColumnDashboard from '@/components/waterColumn/WaterColumnDashboard.vue';
import { CRS } from 'leaflet';
import { LMap, LTileLayer, LControlScale } from 'vue2-leaflet';
// import { openArray } from 'zarr';

export default {
  name: 'cruise-view',
  components: {
    CesiumVue,
    WaterColumnDashboard,
    LMap,
    LTileLayer,
    LControlScale, // https://jsfiddle.net/GwynethLlewelyn/kyf7muta/1/
  },

  data() {
    return {
      url: 'https://cires.s3-us-west-2.amazonaws.com/tiles38/{z}_{x}_{y}.png',
      // url: 'https://storage.googleapis.com/gu1002/wednesday/tiles38/{z}_{x}_{y}.png',
      zoom: 0,
      minZoom: 0,
      maxZoom: 2,
      maxBounds: [[-500, 0], [0, 26000]],
      center: [-250, 6000],
      crs: CRS.Simple,
      coordinatesValue: '',
    };
  },

  methods: {
    ...mapActions('cruiseView', [
      // 'updateTargetLocation',
    ]),
    ...mapActions('mapView', [
      // 'getMetadata',
      // 'getGeoFeatures',
      // 'updateViewRect',
    ]),
    onPathClick({ longitude, latitude }) {
      this.$router.push({
        name: 'cruise-view',
        params: { cruiseName: this.cruiseName },
        query: { longitude, latitude, frequency: parseInt(this.frequencyKHz, 10) },
      });
    },
    loadInitialData() {
      this.flyTo(this.targetLocation);
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
    addMarker(event) {
      const coordinates = event.latlng;
      // this.coordinateValue = 'X: ' + coordinates.lng + ' Y: ' + coordinates.lat;
      this.coordinatesVaue = `X: ${coordinates.lng} Y: ${coordinates.lat}`;
      console.log(this.coordinatesVaue);
    },
  },

  computed: {
    ...mapState('mapView', [
      'viewMetadata',
      'geoJson',
      'viewRect',
    ]),
    ...mapState('cruiseView', [
      'targetLocation',
      'loading',
      'cruiseName',
      'colorPalettes',
      'selectedPalette',
    ]),
    frequency: {
      get() {
        return store.state.cruiseView.frequency;
      },
      set(value) {
        this.$store.dispatch('cruiseView/updateFrequency', value);
      },
    },
    pointerValues: {
      get() {
        return store.state.cruiseView.pointerValues;
      },
      set(values) {
        this.$store.dispatch('cruiseView/updatePointerValues', values);
      },
    },
    lastPixelColor: {
      get() {
        return store.state.cruiseView.lastPixelColor;
      },
      set(value) {
        this.$store.dispatch('cruiseView/updateLastPixelColorValue', value);
      },
    },
  },

  watch: {
    frequencyKHz(freq) {
      const { longitude, latitude } = this.targetLocation;
      this.$router.push({
        name: 'cruise-view',
        params: { cruiseName: this.cruiseName },
        query: { longitude, latitude, frequency: parseInt(freq, 10) },
      });
    },
    targetLocation(tl) {
      this.flyTo(tl);
    },
  },
};
</script>

<style>
  #mapWrapper {
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: 250px; /* controls the height/width of the map thumbnail */
    height: 250px;
    text-align: center;
    cursor: default;
    border: 2px solid #76cbff;
    z-index: 999;
  }
  body { margin: 0; }
  .cruiseView {
    margin: 0; padding: 0; width: 100vw; height: 100vh;
  }
  #coordinatesValue {
    position: absolute;
    top: 0;
    right: 0;
    margin-right: 20px;
    z-index: 9999;
    background-color: white;
  }
  .leaflet-control-zoom { display: none; }
</style>
