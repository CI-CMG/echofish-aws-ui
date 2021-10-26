<template>
  <div id="infoPanel" class="container" :class="{'infoPanel-open': !infoPanelCollapsed}">
    <div class="infoPanel-header row m-2">
      <div class="closebtn"  @click="toggleInfoPanel">
        &times;
<!--        <font-awesome-icon class="expand-icon" icon="angle-double-left" />-->
      </div>
    </div>
    <div  style="width: 100%; height: 150px;">
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
      <br /><br />
      <b-form-checkbox v-model="useLocalTime" name="localTime" switch>Local Time</b-form-checkbox>
      <br />
      <span>
        <span>Time: <b>{{ selectedDateTime }}</b></span><br /><br />
        <span>Longitude: <b>{{ selectedLon }}</b></span><br /><br />
        <span>Latitude: <b>{{ selectedLat }}</b></span><br /><br />
        <span>Depth (m): <b>{{ selectedDepthMeters }}</b></span><br /><br />
        <span v-if="selectedDataValue">Selected: <b>{{ selectedDataValue.toFixed(2) }} dB</b></span>
      </span>
    </div>
  </div>
</template>

<script>
import CesiumVue from '@/components/cesium/CesiumVue.vue';
import logoSmall from '@/assets/blue_small.png';
import { mapMutations, mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      formattedSelectedDataValue: null,
    };
  },

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
      selectedDataValue: 'cruiseView/selectedDataValue',
      centerLat: 'cruiseView/centerLat',
      centerLon: 'cruiseView/centerLon',
      infoPanelCollapsed: 'infoPanel/collapsed',
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
      toggleInfoPanel: 'infoPanel/toggleCollapsed',
    }),
    formatSelectedDataValue() {
      if (this.selectedDataValue != null) {
        this.formattedSelectedDataValue = this.selectedDataValue.toFixed(2);
      } else {
        this.formattedSelectedDataValue = this.selectedDataValue;
      }
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
