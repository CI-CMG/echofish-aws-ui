<template>

  <span>
    <span>{{ cruise }}</span>
    <b-dropdown :text="selectedFrequency">
      <b-dropdown-item v-for="frequency in frequencies" :key="frequency">{{frequency}}</b-dropdown-item>
    </b-dropdown>
    <b-dropdown :text="selectedColorPalette">
      <b-dropdown-item v-for="colorPalette in colorPalettes" :key="colorPalette">{{colorPalette}}</b-dropdown-item>
    </b-dropdown>
    <b-dropdown :text="`${sliderValues[0]} dB - ${sliderValues[1]} dB`" boundary="viewport">
      <b-dropdown-item style="width: 300px; height: 40px;">
        <vue-slider
        ref="slider"
        v-model="sliderValues"
        v-bind="sliderOptions"
        @drag-end="sliderChanged"
      /></b-dropdown-item>
    </b-dropdown>

  </span>
</template>

<script>
import * as d3 from 'd3';
import vueSlider from 'vue-slider-component';
import { colorPalettes, defaultColorPalette } from './WaterColumnColors';

export default {
  components: {
    vueSlider,
  },
  data() {
    return {
      sliderValues: [-80, -35],
      cruise: 'GU1002',
      frequencies: [
        '18kHz',
        '38kHz',
        '120kHz',
        '200kHz',
      ],
      selectedFrequency: '18kHz',
      colorPalettes: Object.keys(colorPalettes),
      selectedColorPalette: defaultColorPalette,
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
  methods: {
    sliderChanged() {
      console.log('slider changed');
    },
  },
};
</script>
