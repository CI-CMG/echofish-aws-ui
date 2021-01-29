<template>
  <div class="map-view">
    <cesium-vue
      :longitude="-105.2705"
      :latitude="40.0150"
      :height="20000000"
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
    ...mapActions({
      getMetadata: 'mapView/getMetadata',
      prepareCruiseView: 'cruiseView/prepareCruiseView',
    }),
    updateViewRect() {

    },
    getGeoFeatures() {

    },
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
