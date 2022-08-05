<template>
  <div class="map-view">
    <b-button id="button-1" v-b-modal.modal-information>Information</b-button>

    <b-modal id="modal-information" title="EchoFish" ok-only hide-footer="true" centered visible>
      <p>Welcome to EchoFish, a data exploration tool for investigating water column sonar data archived at the <b-link id="modal-link" href="https://www.ncei.noaa.gov/products/water-column-sonar-data">NOAA National Centers for Environmental Information</b-link> (NCEI)!</p>
      <br />
      <p>Water column sonar data, the acoustic backscatter from the near-surface of the ocean to the seafloor, are used to assess physical and biological characteristics including the spatial distribution of plankton, fish, methane seeps, and underwater oil plumes.</p>
      <br />
      <p>A copy of the NCEI Water Column Sonar Data Archive is available on <b-link id="modal-link" href="https://registry.opendata.aws/ncei-wcsd-archive/">Amazon Web Services</b-link>. EchoFish currently displays the cloud-hosted EK60 datasets. EchoFish is being developed by CIRES / NCEI staff and will progressively include more functionality, improved performance, and additional datasets. Visit often!</p>
      <br />
      <p>Please send questions or comments to <b-link id="modal-link" href = "mailto: wcd.info@noaa.gov">wcd.info@noaa.gov</b-link></p>
    </b-modal>

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
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped>
  #button-1 {
    position: absolute;
    bottom: 15px;
    left: 15px;
    z-index: 999;
  }
  #modal-information p {
    font-size: 1.35em;
  }
  #modal-link {
    color: blue;
    text-decoration: underline;
  }
</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
