<template>
  <div class="map-view">
    <cesium-vue
      :initial-longitude="-105.2705"
      :initial-latitude="40.0150"
      :initial-height="20000000"
      :maximum-zoom-distance="25000000"
      :geo-json="geoJson"
      :view-rect="viewRect"
      :get-geo-features="getGeoFeatures"
      :update-view-rect="updateViewRect"
      :on-path-click="onPathClick"
    />
  </div>
</template>


<script>
import { mapState, mapActions } from 'vuex';
import CesiumVue from '@/components/cesium/CesiumVue.vue';

export default {

  components: {
    CesiumVue,
  },

  computed: {
    ...mapState('mapView', ['geoJson', 'viewRect']),
  },

  methods: {
    ...mapActions('mapView', ['getGeoFeatures', 'getMetadata', 'updateViewRect']),
    // onPathClick({ longitude, latitude, cruiseName }) {
    // this.$router.push({
    //   name: 'cruise-view',
    //   params: { cruiseName },
    //   query: { longitude, latitude },
    // });
    onPathClick() {
      this.$router.push({ name: 'cruise-view' });
    },
  },
};
</script>
