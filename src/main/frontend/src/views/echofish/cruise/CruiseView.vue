<template>
  <b-container fluid class="pr-0 pl-0">
    <b-row no-gutters style="height: 30px;">
      <b-col style="background-color: green; ">
        <Header/>
      </b-col>
    </b-row>
    <b-row no-gutters style="background-color: blue; height: 100vh;
    margin-top: -30px;
    padding-top: 30px;
    margin-bottom: -30px;
    padding-bottom: 30px;
">
      <b-col sm="3" xl="2" style="background-color: orange;">
        <InfoPanel/>
      </b-col>
      <b-col  style="background-color: teal;">
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
        </l-map>
      </b-col>
    </b-row>
    <b-row no-gutters style="height: 30px;">
      <b-col style="background-color: yellow;">
        <Footer/>
      </b-col>
    </b-row>
  </b-container>
  <!--  <div class="cruiseView">-->
  <!--    <div class="cruiseViewHeader"></div>-->
  <!--&lt;!&ndash;    <div class="cruiseViewContent">&ndash;&gt;-->
  <!--      <b-container fluid class="cruiseViewContent pr-0 pl-0">-->
  <!--        <b-row no-gutters >-->
  <!--          <b-col xs="2"  class="cruiseViewInfoPanel">-->
  <!--&lt;!&ndash;            <div class="cruiseViewInfoPanel"></div>&ndash;&gt;-->
  <!--            Info-->
  <!--          </b-col>-->
  <!--          <b-col class="cruiseViewEchogram">-->
  <!--&lt;!&ndash;            <div class="cruiseViewEchogram">&ndash;&gt;-->
  <!--              <l-map-->
  <!--                ref="map"-->
  <!--                :crs="crs"-->
  <!--                :zoom="zoom"-->
  <!--                :minZoom="minZoom"-->
  <!--                :maxZoom="maxZoom"-->
  <!--                :maxBounds="maxBounds"-->
  <!--                :center="center"-->
  <!--                @click="addMarker"-->
  <!--                class="cruiseViewEchogramLeaflet"-->
  <!--              >-->
  <!--                <l-tile-layer-->
  <!--                  :url="url"-->
  <!--                />-->
  <!--                <l-control-scale position="bottomleft" :imperial="false" :metric="true"></l-control-scale>-->
  <!--              </l-map>-->
  <!--&lt;!&ndash;            </div>&ndash;&gt;-->
  <!--          </b-col>-->
  <!--        </b-row>-->
  <!--      </b-container>-->

  <!--&lt;!&ndash;    </div>&ndash;&gt;-->

  <!--    <div class="cruiseViewFooter"></div>-->
  <!--    &lt;!&ndash;    <div id='coordinatesValue'><p>{{ coordinatesValue }}</p></div>&ndash;&gt;-->

  <!--    &lt;!&ndash;    <div class="mapscroll" ref="cs" />&ndash;&gt;-->

  <!--    &lt;!&ndash;    <div id="mapWrapper">&ndash;&gt;-->
  <!--    &lt;!&ndash;      <cesium-vue&ndash;&gt;-->
  <!--    &lt;!&ndash;        ref="map"&ndash;&gt;-->
  <!--    &lt;!&ndash;        :initial-longitude="67.89"&ndash;&gt;-->
  <!--    &lt;!&ndash;        :initial-latitude="123.45"&ndash;&gt;-->
  <!--    &lt;!&ndash;        :initial-height="20000.0"&ndash;&gt;-->
  <!--    &lt;!&ndash;        :maximum-zoom-distance="25000000"&ndash;&gt;-->
  <!--    &lt;!&ndash;        :geo-json="geoJson"&ndash;&gt;-->
  <!--    &lt;!&ndash;        :cruise-name="cruiseName"&ndash;&gt;-->
  <!--    &lt;!&ndash;        :on-path-click="onPathClick"&ndash;&gt;-->
  <!--    &lt;!&ndash;      />&ndash;&gt;-->
  <!--    &lt;!&ndash;    </div>&ndash;&gt;-->

  <!--    &lt;!&ndash;    <WaterColumnDashboard />&ndash;&gt;-->

  <!--  </div>-->
</template>

<script>
import { LMap, LTileLayer } from 'vue2-leaflet';
import { CRS } from 'leaflet';
import Header from './Header.vue';
import Footer from './Footer.vue';
import InfoPanel from './InfoPanel.vue';

export default {
  components: {
    Header,
    Footer,
    InfoPanel,
    LMap,
    LTileLayer,
  },
  data() {
    return {
      url: 'https://cires.s3-us-west-2.amazonaws.com/tiles38/{z}_{x}_{y}.png',
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
    addMarker(event) {
      const coordinates = event.latlng;
      console.log(coordinates);
      // // this.coordinateValue = 'X: ' + coordinates.lng + ' Y: ' + coordinates.lat;
      // this.coordinatesVaue = `X: ${coordinates.lng} Y: ${coordinates.lat}`;
      // console.log(this.coordinatesVaue);
    },
  },
};
</script>

<!--<script>-->
<!--/* eslint-disable vue/no-unused-components */-->

<!--import Cesium from 'cesium/Cesium';-->
<!--import CesiumVue from '@/components/cesium/CesiumVue.vue';-->
<!--import { mapState, mapActions } from 'vuex';-->
<!--import logoSmall from '@/assets/blue_small.png';-->
<!--import store from '@/store/store';-->
<!--import WaterColumnDashboard from '@/components/waterColumn/WaterColumnDashboard.vue';-->
<!--import { CRS } from 'leaflet';-->
<!--import { LMap, LTileLayer, LControlScale } from 'vue2-leaflet';-->
<!--// import { openArray } from 'zarr';-->

<!--export default {-->
<!--  name: 'cruise-view',-->
<!--  components: {-->
<!--    CesiumVue,-->
<!--    WaterColumnDashboard,-->
<!--    LMap,-->
<!--    LTileLayer,-->
<!--    LControlScale, // https://jsfiddle.net/GwynethLlewelyn/kyf7muta/1/-->
<!--  },-->

<!--  data() {-->
<!--    return {-->
<!--      url: 'https://cires.s3-us-west-2.amazonaws.com/tiles38/{z}_{x}_{y}.png',-->
<!--      // url: 'https://storage.googleapis.com/gu1002/wednesday/tiles38/{z}_{x}_{y}.png',-->
<!--      zoom: 0,-->
<!--      minZoom: 0,-->
<!--      maxZoom: 2,-->
<!--      maxBounds: [[-500, 0], [0, 26000]],-->
<!--      center: [-250, 6000],-->
<!--      crs: CRS.Simple,-->
<!--      coordinatesValue: '',-->
<!--    };-->
<!--  },-->

<!--  methods: {-->
<!--    ...mapActions('cruiseView', [-->
<!--      // 'updateTargetLocation',-->
<!--    ]),-->
<!--    ...mapActions('mapView', [-->
<!--      // 'getMetadata',-->
<!--      // 'getGeoFeatures',-->
<!--      // 'updateViewRect',-->
<!--    ]),-->
<!--    onPathClick({ longitude, latitude }) {-->
<!--      this.$router.push({-->
<!--        name: 'cruise-view',-->
<!--        params: { cruiseName: this.cruiseName },-->
<!--        query: { longitude, latitude, frequency: parseInt(this.frequencyKHz, 10) },-->
<!--      });-->
<!--    },-->
<!--    loadInitialData() {-->
<!--      this.flyTo(this.targetLocation);-->
<!--    },-->
<!--    flyTo({ latitude, longitude }) {-->
<!--      this.$refs.map.getViewer().camera.flyTo({-->
<!--        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 20000.0),-->
<!--      });-->

<!--      if (!this.billboard) {-->
<!--        this.billboard = this.$refs.map.getViewer().entities.add({-->
<!--          position: Cesium.Cartesian3.fromDegrees(-->
<!--            longitude,-->
<!--            latitude,-->
<!--          ),-->
<!--          billboard: {-->
<!--            image: logoSmall,-->
<!--            width: 20,-->
<!--            height: 20,-->
<!--          },-->
<!--        });-->
<!--      } else {-->
<!--        this.billboard.position = Cesium.Cartesian3.fromDegrees(-->
<!--          longitude,-->
<!--          latitude,-->
<!--        );-->
<!--      }-->
<!--    },-->
<!--    addMarker(event) {-->
<!--      const coordinates = event.latlng;-->
<!--      // this.coordinateValue = 'X: ' + coordinates.lng + ' Y: ' + coordinates.lat;-->
<!--      this.coordinatesVaue = `X: ${coordinates.lng} Y: ${coordinates.lat}`;-->
<!--      console.log(this.coordinatesVaue);-->
<!--    },-->
<!--  },-->

<!--  computed: {-->
<!--    ...mapState('mapView', [-->
<!--      'viewMetadata',-->
<!--      'geoJson',-->
<!--      'viewRect',-->
<!--    ]),-->
<!--    ...mapState('cruiseView', [-->
<!--      'targetLocation',-->
<!--      'loading',-->
<!--      'cruiseName',-->
<!--      'colorPalettes',-->
<!--      'selectedPalette',-->
<!--    ]),-->
<!--    frequency: {-->
<!--      get() {-->
<!--        return store.state.cruiseView.frequency;-->
<!--      },-->
<!--      set(value) {-->
<!--        this.$store.dispatch('cruiseView/updateFrequency', value);-->
<!--      },-->
<!--    },-->
<!--    pointerValues: {-->
<!--      get() {-->
<!--        return store.state.cruiseView.pointerValues;-->
<!--      },-->
<!--      set(values) {-->
<!--        this.$store.dispatch('cruiseView/updatePointerValues', values);-->
<!--      },-->
<!--    },-->
<!--    lastPixelColor: {-->
<!--      get() {-->
<!--        return store.state.cruiseView.lastPixelColor;-->
<!--      },-->
<!--      set(value) {-->
<!--        this.$store.dispatch('cruiseView/updateLastPixelColorValue', value);-->
<!--      },-->
<!--    },-->
<!--  },-->

<!--  watch: {-->
<!--    frequencyKHz(freq) {-->
<!--      const { longitude, latitude } = this.targetLocation;-->
<!--      this.$router.push({-->
<!--        name: 'cruise-view',-->
<!--        params: { cruiseName: this.cruiseName },-->
<!--        query: { longitude, latitude, frequency: parseInt(freq, 10) },-->
<!--      });-->
<!--    },-->
<!--    targetLocation(tl) {-->
<!--      this.flyTo(tl);-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style>-->
<!--  #mapWrapper {-->
<!--    position: absolute;-->
<!--    bottom: 10px;-->
<!--    left: 10px;-->
<!--    width: 250px; /* controls the height/width of the map thumbnail */-->
<!--    height: 250px;-->
<!--    text-align: center;-->
<!--    cursor: default;-->
<!--    border: 2px solid #76cbff;-->
<!--    z-index: 999;-->
<!--  }-->
<!--  body { margin: 0; }-->
<!--  .cruiseView {-->
<!--    margin: 0; padding: 0; width: 100vw; height: 100vh;-->
<!--  }-->
<!--  #coordinatesValue {-->
<!--    position: absolute;-->
<!--    top: 0;-->
<!--    right: 0;-->
<!--    margin-right: 20px;-->
<!--    z-index: 9999;-->
<!--    background-color: white;-->
<!--  }-->
<!--  .leaflet-control-zoom { display: none; }-->
<!--</style>-->
