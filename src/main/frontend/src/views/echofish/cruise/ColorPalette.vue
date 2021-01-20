<template>
  <div>
    <span>
      <svg  height="35" width="500">
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
          @click="() => showValue(index)"
        />
      </svg>
      <b-popover v-for="(color, index) in palette" :key="index" :target="`${id}-${index}`" triggers="click blur" placement="top">
        {{colorValueArray[index]}}
      </b-popover>
    </span>
  </div>
</template>

<script>
import * as d3 from 'd3';
// import { range } from 'd3-array';
// import { scaleOrdinal } from 'd3-scale';
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
      width: 500,
      height: 25,
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
    // colorScaleFunction(d) {
    //   const values = scaleOrdinal().domain(this.colorValueArray).range(this.palette);
    //   const value = scaleOrdinal().domain(this.colorValueArray).range(this.palette)(d);
    //   console.log(values);
    //   return value;
    // },
  },
};
</script>
