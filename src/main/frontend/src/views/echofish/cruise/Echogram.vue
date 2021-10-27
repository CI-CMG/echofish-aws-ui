<template>

  <l-map
    v-if="center.length || zarr.dataStore"
    ref="map"
    :crs="crs"
    :zoom="zoom"
    :center="center"
    :minZoom="0"
    :maxZoom="0"
    :maxBounds="maxBounds"
    @click="cursorUpdated"
    @update:center="mapCenterUpdated"
    :options="{zoomControl: false}"
  >
    <l-marker
      v-if="svVisible"
      :lat-lng="svMarker"></l-marker>
    <l-grid-layer
      id="tile-property-wrapper"
      :tile-component="tileComponent"
      :tileSize=512
    >
    </l-grid-layer>
    <l-control-zoom position="bottomright"></l-control-zoom>
  </l-map>

</template>

<script>
import Vue from 'vue';
import { CRS } from 'leaflet';
import { mapMutations, mapGetters, mapActions } from 'vuex';
import {
  LMap, LGridLayer, LControlZoom, LMarker,
} from 'vue2-leaflet';
import TileComponent from './TileComponent.vue';

const TilePropertyWrapper = (component, props) => Vue.component('tile-property-wrapper', {
  template: '#tile-property-wrapper',
  props: ['coords'],
  render(createElement) {
    return createElement(component, {
      props: {
        ...props,
        coords: this.coords,
      },
    });
  },
});

export default {

  props: [
    'onMoveEchogram',
  ],

  data() {
    return {
      crs: CRS.Simple,
      zoom: 0,
      svMarker: [-204, 113503],
      svVisible: false,
    };
  },

  components: {
    LMap,
    LGridLayer,
    LControlZoom,
    LMarker,
  },

  computed: {
    ...mapGetters({
      storeIndex: 'cruiseView/storeIndex',
      cruise: 'cruiseView/cruise',
      maxBounds: 'cruiseView/maxBounds',
      center: 'cruiseView/center',
      selectedFrequency: 'cruiseView/selectedFrequency',
      zarr: 'cruiseView/zarr',
      selectedLat: 'cruiseView/selectedLat',
      selectedLon: 'cruiseView/selectedLon',
      selectedTimestampMillis: 'cruiseView/selectedTimestampMillis',
      selectedDepthMeters: 'cruiseView/selectedDepthMeters',
    }),
    tileComponent() {
      return TilePropertyWrapper(TileComponent);
    },
  },

  methods: {
    ...mapMutations({
      onSelectPoint: 'cruiseView/onSelectPoint',
    }),
    ...mapActions({
      updateCursorValues: 'cruiseView/updateCursorValues',
    }),
    cursorUpdated(e) {
      const cursorLocation = e.latlng;
      this.svMarker = cursorLocation;
      this.svVisible = true;
      this.updateCursorValues({
        storeIndex: Math.floor(cursorLocation.lng),
        depthMeters: cursorLocation.lat.toFixed(2),
      });

      this.onSelectPoint({
        lat: this.selectedLat,
        lon: this.selectedLon,
        epochMillis: this.selectedTimestampMillis,
        depthMeters: this.selectedDepthMeters,
      });
    },
    mapCenterUpdated(center) {
      if (center) {
        const storeIndex = Math.min(Math.round(center.lng), this.zarr.dataArray.shape[1]);
        const depthIndex = Math.min(Math.round(-1 * center.lat), this.zarr.dataArray.shape[0]);
        this.onMoveEchogram({ storeIndex, depthIndex });
      }
    },
  },

  created() {

  },
};
</script>
