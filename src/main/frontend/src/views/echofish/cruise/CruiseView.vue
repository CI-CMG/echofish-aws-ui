<template>
  <b-container fluid class="pr-0 pl-0">
    <b-row no-gutters style="height: 30px;">
      <b-col style="background-color: green; ">
        <Header :cruise="cruise"/>
      </b-col>
    </b-row>
    <b-row no-gutters style="background-color: blue; height: 100vh;
    margin-top: -30px;
    padding-top: 30px;
    margin-bottom: -30px;
    padding-bottom: 30px;
">
      <b-col sm="3" xl="2" style="background-color: orange;">
        <InfoPanel :lon="lon" :lat="lat"/>
      </b-col>
      <b-col  style="background-color: teal;">
        <Echogram :cruise="cruise" :onMoveEchogram="onMoveEchogram"/>
      </b-col>
    </b-row>
    <b-row no-gutters style="height: 30px;">
      <b-col style="background-color: yellow;">
        <Footer/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from 'vuex';
import Header from './Header.vue';
import Footer from './Footer.vue';
import InfoPanel from './InfoPanel.vue';
import Echogram from './Echogram.vue';

export default {
  components: {
    Header,
    Footer,
    InfoPanel,
    Echogram,
  },
  props: [
    'cruise',
    'longitude',
    'latitude',
  ],
  computed: {
    ...mapGetters({
      storeIndex: 'cruiseView/storeIndex',
    }),
    lon() {
      return parseFloat(this.longitude);
    },
    lat() {
      return parseFloat(this.latitude);
    },
    latLonCruise() {
      return {
        lat: this.lat,
        lon: this.lon,
        cruise: this.cruise,
      };
    },
  },
  mounted() {
    this.updateStoreIndex({
      lat: this.lat,
      lon: this.lon,
      cruise: this.cruise,
    });
  },
  watch: {
    latLonCruise(value) {
      this.updateStoreIndex(value);
    },
  },
  methods: {
    ...mapMutations({
      onSelectPoint: 'cruiseView/onSelectPoint',
      storeOnMoveEchogram: 'cruiseView/onMoveEchogram',
    }),
    ...mapActions({
      updateStoreIndex: 'cruiseView/updateStoreIndex',
    }),
    onMoveEchogram(move) {
      this.storeOnMoveEchogram(move);
      this.$router.push({ name: 'cruise-view', params: { cruise: this.cruise, longitude: move.lon, latitude: move.lat } });
    },
  },
};
</script>
