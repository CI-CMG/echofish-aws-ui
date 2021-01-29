<template>
  <l-map v-if="center.length"
    :crs="crs"
    :center="center"
    :minZoom="0"
    :maxZoom="0"
    :maxBounds="maxBounds"
    @click="updateCursor"
    @update:center="mapCenterUpdated">

    <l-grid-layer :tile-component="TileComponent" :tileSize=512></l-grid-layer>

  </l-map>
</template>

<script>
import { CRS } from 'leaflet';
import { mapMutations, mapGetters } from 'vuex';
import { LMap, LGridLayer } from 'vue2-leaflet';
import TileComponent from './TileComponent.vue';

export default {
  props: [
    'onMoveEchogram',
  ],
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
  data() {
    return {
      crs: CRS.Simple,
      TileComponent,
    };
  },
};
</script>
