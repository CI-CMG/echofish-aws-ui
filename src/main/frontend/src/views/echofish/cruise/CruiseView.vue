<template>
  <b-container fluid class="pr-0 pl-0">
    <b-row no-gutters style="height: 30px;">
      <b-col style="background-color: green; ">
        <Header />
      </b-col>
    </b-row>
    <b-row no-gutters style="background-color: blue; height: 100vh;
    margin-top: -30px;
    padding-top: 30px;
    margin-bottom: -30px;
    padding-bottom: 30px;
">
      <b-col sm="3" xl="2" style="background-color: orange;">
        <InfoPanel />
      </b-col>
      <b-col  style="background-color: teal;">
        <Echogram :onMoveEchogram="onMoveEchogram"/>
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
import { mapMutations, mapActions } from 'vuex';
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
    'storeIndex',
    'frequency',
  ],
  computed: {
    // ...mapGetters({
    //   storeIndex: 'cruiseView/storeIndex',
    // }),
    freq() {
      return parseInt(this.frequency, 10);
    },
    index() {
      return parseInt(this.storeIndex, 10);
    },
    storeState() {
      return {
        frequency: this.freq,
        storeIndex: this.index,
        cruise: this.cruise,
      };
    },
  },
  mounted() {
    this.prepareCruiseView({
      frequency: this.freq,
      storeIndex: this.index,
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
    }),
    onMoveEchogram(index) {
      this.$router.push({ name: 'cruise-view', params: { cruise: this.cruise, frequency: this.freq, storeIndex: index } });
      // this.prepareCruiseView({ storeIndex: index, frequency: this.freq, cruise: this.cruise })
      //   .then(({ storeIndex, frequency, cruise }) => this.$router.push({ name: 'cruise-view', params: { cruise, frequency, storeIndex } }));
    },
  },
};
</script>
