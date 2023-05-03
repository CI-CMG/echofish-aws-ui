<template>
  <div align="center">
    <span>
      <svg  height="35" width="400">
        <rect
          v-for="(color, index) in palette"
          :id="`${id}-${index}`"
          class="bars"
          :key="index"
          :width="width / palette.length"
          :height="height"
          :x="index * width / palette.length"
          y="0"
          :style="`fill: ${color};`"
        />
        <text
          :width="width"
          :height="height"
          :x="width * .25"
          :y="10+height"
        >{{legendValue(25)}}</text>
        <text
          :width="width"
          :height="height"
          :x="width * .50"
          :y="10+height"
        >{{legendValue(50)}}</text>
        <text
          :width="width"
          :height="height"
          :x="width * .75"
          :y="10+height"
        >{{legendValue(75)}}</text>
      </svg>
      <b-popover v-for="(color, index) in palette" :key="index" :target="`${id}-${index}`" triggers="click blur" placement="top">
        {{popupRange(index)}}
      </b-popover>
    </span>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { mapMutations } from 'vuex';
import { colorPalettes } from './WaterColumnColors';
import idGen from '../../../idGenerator';

export default {
  props: [
    'selectedColorPalette',
    'min',
    'max',
  ],
  data() {
    return {
      width: 400,
      height: 20,
      id: '',
    };
  },
  created() {
    this.id = idGen();
  },
  computed: {
    colorValueArray() {
      return d3.range(
        this.min,
        this.max,
        (this.max - this.min) / this.palette.length,
      );
    },
    palette() {
      return colorPalettes[this.selectedColorPalette];
    },
  },
  methods: {
    ...mapMutations({
      setColorValueArray: 'cruiseView/colorValueArray',
    }),
    popupRange(index) {
      this.setColorValueArray(this.colorValueArray);
      const min = this.colorValueArray[index];
      const max = index === this.colorValueArray.length - 1 ? this.max : this.colorValueArray[index + 1];
      return `${min.toFixed(2)} to ${max.toFixed(2)}`;
    },
    legendValue(percent) {
      const range = Math.abs(this.max - this.min);
      const decimal = percent / 100;
      const value = this.min + (range * decimal);
      return `${(value).toFixed(2)}`;
    },
  },
};
</script>
