<template>
  <div class="wrapper">
  <b-container fluid class="pr-0 pl-0">
    <div id="content" :class="{'InfoPanel-open': !infoPanelCollapsed }">
      <b-row no-gutters>
        <b-col class="cruiseview-header" >
          <Header />
        </b-col>
      </b-row>
      <b-row no-gutters style="
      background-color: blue;
      margin-top: -40px;
      padding-top: 40px;
      /*margin-bottom: -30px;*/
      padding-bottom: 30px;
      height: 100vh;
    ">
        <div class="overlay"
             :class="{'InfoPanel-open': !infoPanelCollapsed}"
             @click="toggleInfoPanel">
        </div>
        <InfoPanel />
        <b-col  style="background-color: teal;">
          <Echogram :onMoveEchogram="onMoveEchogram"/>
        </b-col>
      </b-row>

<!--      <b-row no-gutters style="height: 30px;">-->
<!--        <b-col class="cruiseview">-->
<!--          <Footer/>-->
<!--        </b-col>-->
<!--      </b-row>-->
    </div>
  </b-container>
  </div>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from 'vuex';
import Header from './Header.vue';
// import Footer from './Footer.vue';
import InfoPanel from './InfoPanel.vue';
import Echogram from './Echogram.vue';

export default {
  components: {
    Header,
    // Footer,
    InfoPanel,
    Echogram,
  },
  props: [
    'cruise',
    'storeIndex',
    'depthIndex',
    'frequency',
  ],
  computed: {
    // ...mapGetters({
    //   storeIndex: 'cruiseView/storeIndex',
    // }),
    ...mapGetters({ infoPanelCollapsed: 'infoPanel/collapsed' }),
    freq() {
      return parseInt(this.frequency, 10);
    },
    index() {
      return parseInt(this.storeIndex, 10);
    },
    depth() {
      return parseInt(this.depthIndex, 10);
    },
    storeState() {
      return {
        frequency: this.freq,
        storeIndex: this.index,
        depthIndex: this.depth,
        cruise: this.cruise,
      };
    },
  },
  mounted() {
    this.prepareCruiseView({
      frequency: this.freq,
      storeIndex: this.index,
      depthIndex: this.depth,
      cruise: this.cruise,
    });
  },
  watch: {
    storeState(value) {
      this.prepareCruiseView(value);
    },
  },
  methods: {
    ...mapMutations({
      onSelectPoint: 'cruiseView/onSelectPoint',
      storeOnMoveEchogram: 'cruiseView/onMoveEchogram',
    }),
    ...mapActions({
      prepareCruiseView: 'cruiseView/prepareCruiseView',
      toggleInfoPanel: 'infoPanel/toggleCollapsed',
      // updateCursorValues: 'cruiseView/updateCursorValues',
    }),
    onMoveEchogram({ storeIndex, depthIndex }) {
      this.$router.push({
        name: 'cruise-view',
        params: {
          cruise: this.cruise, frequency: this.freq, storeIndex, depthIndex,
        },
      }).catch((err) => {
        // Ignore the vuex err regarding  navigating to the page they are already on.
        if (
          err.name !== 'NavigationDuplicated'
          && !err.message.includes('Avoided redundant navigation to current location')
        ) {
          throw err;
        }
      });
    },
  },
};
</script>
