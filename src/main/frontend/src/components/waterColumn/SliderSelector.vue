<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<template>
    <div class="sliderSelector">

      <div class="sliderContainer">
        <vue-slider
          ref="slider"
          v-model="sliderValues"
          v-bind="sliderOptions"
          @drag-end="sliderChanged"
        />
<!--        TODO: Update slider based on vuex state, use debounce to update properly-->
        <br />
      </div>

    </div>
</template>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<script>

import { mapActions, mapState } from 'vuex';
import vueSlider from 'vue-slider-component';
// import 'vue-slider-component/theme/antd.css';
import store from '@/store/store';
import * as d3 from 'd3';

const sliderOptions = {
  contained: false,
  min: -100,
  max: 0,
  interval: 1,
  dotSize: 15,
  tooltipPlacement: 'top',
  useKeyboard: true,
  enableCross: false,
  marks: d3.range(-100, 10, 10),
};

export default {
  name: 'SliderSelector',

  components: {
    vueSlider,
  },

  data() {
    return { sliderOptions };
  },

  computed: {
    ...mapState('cruiseView', [
      'colorPalettes',
      'selectedPalette',
    ]),
    sliderValues: { // v-model requires getters & setters
      get() {
        return store.state.cruiseView.sliderValues;
      },
      set(values) {
        this.$store.dispatch('cruiseView/updateSliderValues', values);
        // const { min, max } = values;
        // const palette = this.colorPalettes[this.selectedPalette];
        // this.colorValueArray = d3.range(min, max, (max - min) / palette.length);
      },
    },
    colorValueArray: {
      get() {
        return store.state.cruiseView.colorValueArray;
      },
      set(arr) {
        this.$store.dispatch('cruiseView/updateColorValueArray', arr);
      },
    },
  },

  methods: {
    ...mapActions('cruiseView', [
      'redraw',
    ]),
    sliderChanged() {
      console.log('slider changed');
      this.redraw();
    },
  },
};
</script>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped>
  .sliderContainer {
    display: block;
    margin-left: auto; margin-right: auto;
    width: 75%;
  }
  .sliderSelector {
    margin-bottom: 10px;
  }
</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
