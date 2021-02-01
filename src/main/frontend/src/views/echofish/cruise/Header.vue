<template>

  <span>
    <span class="mr-2 ml-2">Cruise: <b>{{ cruise }}</b></span>
<!--    TODO remove me -->
<!--    <span class="mr-2">{{ storeIndex }}</span>-->
    <b-dropdown :text="`${selectedFrequency}`">
      <b-dropdown-item v-for="frequency in frequencies" :key="frequency" @click="() => setSelectedFrequency(frequency)">{{frequency}}</b-dropdown-item>
    </b-dropdown>
    <b-dropdown :text="selectedColorPalette">
      <b-dropdown-item v-for="colorPalette in colorPalettes" :key="colorPalette" @click="() => setSelectedColorPalette(colorPalette)">{{colorPalette}}</b-dropdown-item>
    </b-dropdown>
    <b-dropdown :text="`${sliderValues[0]} dB - ${sliderValues[1]} dB`" boundary="viewport">
      <b-dropdown-item style="width: 300px; height: 40px;">
        <vue-slider v-model="sliderValues" v-bind="sliderOptions"/>
      </b-dropdown-item>
    </b-dropdown>

  </span>
</template>

<script>
import * as d3 from 'd3';
import vueSlider from 'vue-slider-component';
import { mapMutations, mapGetters } from 'vuex';
import { colorPalettes } from './WaterColumnColors';

export default {
  components: {
    vueSlider,
  },
  computed: {
    ...mapGetters({
      frequencies: 'cruiseView/frequencies',
      selectedFrequency: 'cruiseView/selectedFrequency',
      storeSliderValues: 'cruiseView/sliderValues',
      selectedColorPalette: 'cruiseView/selectedColorPalette',
      storeIndex: 'cruiseView/storeIndex',
      cruise: 'cruiseView/cruise',
    }),
    sliderValues: {
      get() {
        return this.storeSliderValues;
      },
      set(value) {
        this.setSliderValues(value);
      },
    },
  },
  methods: {
    ...mapMutations({
      // setSelectedFrequency: 'cruiseView/selectedFrequency',
      setSliderValues: 'cruiseView/sliderValues',
      setSelectedColorPalette: 'cruiseView/selectedColorPalette',
    }),
    setSelectedFrequency(frequency) {
      this.$router.push({ name: 'cruise-view', params: { cruise: this.cruise, frequency, storeIndex: this.storeIndex } });
    },
  },
  data() {
    return {
      colorPalettes: Object.keys(colorPalettes),
      sliderOptions: {
        contained: false,
        min: -100,
        max: 0,
        interval: 1,
        dotSize: 15,
        tooltipPlacement: 'top',
        useKeyboard: true,
        enableCross: false,
        marks: d3.range(-100, 10, 10),
      },
    };
  },

};
</script>
