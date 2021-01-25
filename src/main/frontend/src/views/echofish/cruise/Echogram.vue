<template>
  <l-map
    ref="map"
    :crs="crs"
    :zoom="zoom"
    :center="center"
    @update:zoom="onZoom"
    @update:center="onCenter"
    @update:bounds="boundsUpdated"
    :minZoom="minZoom"
    :maxZoom="maxZoom"
    :maxBounds="maxBounds"
    @click="addMarker"
  >
    <l-tile-layer
      :url="url"
    />
  </l-map>
</template>

<script>
import { CRS } from 'leaflet';
import { mapMutations, mapGetters } from 'vuex';
import { LMap, LTileLayer } from 'vue2-leaflet';

export default {
  props: [
    'onMoveEchogram',
  ],
  components: {
    LMap,
    LTileLayer,
  },
  computed: {
    ...mapGetters({
      mockCenter: 'cruiseView/center',
      zoom: 'cruiseView/zoom',
      storeIndex: 'cruiseView/storeIndex',
      cruise: 'cruiseView/cruise',
    }),
    center() {
      // TODO convert storeIndex to center
      // eslint-disable-next-line no-unused-vars
      const storeIndex = this.storeIndex;
      return this.mockCenter;
    },
  },
  methods: {
    ...mapMutations({
      onSelectPoint: 'cruiseView/onSelectPoint',
      setCenter: 'cruiseView/center',
      setZoom: 'cruiseView/zoom',
    }),
    addMarker() {
      const epochMillis = Math.floor(Math.random() * 1611184676926) + 1;
      const depthMeters = Math.floor(Math.random() * 600);
      this.onSelectPoint({
        lat: Math.floor(Math.random() * 181) - 90,
        lon: Math.floor(Math.random() * 361) - 180,
        epochMillis,
        depthMeters,
      });
    },
    onZoom(zoom) {
      console.log(zoom);
      this.setZoom(zoom);
      // TODO implement me for real
      this.onMoveEchogram(this.storeIndex + 100);
    },
    onCenter(center) {
      console.log(center);
      this.setCenter(center);
      // TODO implement me for real
      this.onMoveEchogram(this.storeIndex + 100);
    },
    boundsUpdated(bounds) {
      console.log(bounds);
    },
  },
  data() {
    return {
      url: 'https://cires.s3-us-west-2.amazonaws.com/tiles38/{z}_{x}_{y}.png',
      minZoom: 0,
      maxZoom: 2,
      maxBounds: [[-500, 0], [0, 26000]],
      crs: CRS.Simple,
    };
  },
};
</script>
