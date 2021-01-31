<template>

  <l-map
    v-if="center.length || zarr.dataStore"
    ref="map"
    :crs="crs"
    :center="center"
    :minZoom="0"
    :maxZoom="0"
    :maxBounds="maxBounds"
    @click="updateCursor"
    @update:center="mapCenterUpdated"
  >
    <l-grid-layer
      id="tile-property-wrapper"
      :tile-component="tileComponent"
      :tileSize=512
    >
    </l-grid-layer>
  </l-map>

</template>

<script>
import Vue from 'vue';
import { CRS } from 'leaflet';
import { mapMutations, mapGetters } from 'vuex';
import { LMap, LGridLayer } from 'vue2-leaflet';
import { openArray } from 'zarr';
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
      maxBoundsValue: null,
      dataDimension: null,
      z: {
        dataStore: null,
      },
    };
  },

  components: {
    LMap,
    LGridLayer,
  },

  computed: {
    ...mapGetters({
      storeIndex: 'cruiseView/storeIndex',
      cruise: 'cruiseView/cruise',
      maxBounds: 'cruiseView/maxBounds',
      center: 'cruiseView/center',
      selectedFrequency: 'cruiseView/selectedFrequency',
      zarr: 'cruiseView/zarr',
    }),
    tileComponent() {
      return TilePropertyWrapper(TileComponent, {
        dataStore: this.z.dataStore,
        maxBoundsValue: this.maxBoundsValue,
        dataDimension: this.dataDimension,
      });
    },
  },

  methods: {
    ...mapMutations({
      onSelectPoint: 'cruiseView/onSelectPoint',
    }),
    updateCursor() {
      const epochMillis = Math.floor(Math.random() * 1611184676926) + 1;
      const depthMeters = Math.floor(Math.random() * 600);
      this.onSelectPoint({
        lat: Math.floor(Math.random() * 181) - 90,
        lon: Math.floor(Math.random() * 361) - 180,
        epochMillis,
        depthMeters,
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
    openArray({ store: 'https://ef-demo-zarr-store.s3-us-west-2.amazonaws.com/GU1002_resample.zarr', path: 'data', mode: 'r' })
      .then((x) => {
        this.z.dataStore = x;
        this.dataDimension = x.meta.shape; // {1000, 19747, 5};
        this.maxBoundsValue = [[-1 * Math.ceil(x.meta.shape[0] / 512) * 512, 0], [0, Math.ceil(x.meta.shape[1] / 512) * 512]];
      });
  },
};
</script>
