<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<template>
    <div class="colorPaletteValues">

        <label>Color Palette:
            <select v-model="selectedPalette" @change="onPaletteChange()">
                <option
                    v-for="(color, palette) in colorPalettes"
                    v-bind:value="palette"
                    v-bind:key="palette"
                >
                    {{ palette }}
                </option>
            </select>
            [selected: <b>{{ selectedPalette }}]</b>
        </label>

        <hr />
        <p>Current Visualization Range: [Min] <b>{{ sliderValues[0] }} dB</b>, [Max] <b>{{ sliderValues[1] }} dB</b></p>

        <span id="colorPaletteValue">...</span>
        <div>
            <span id="colorPalette"/>
        </div>

    </div>
</template>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<script>

import { mapActions, mapState } from 'vuex';
import * as d3 from 'd3';
import { range } from 'd3-array';
import { scaleOrdinal } from 'd3-scale';
import store from '@/store/store';

export default {
  name: 'ColorPaletteValues',

  methods: {
    ...mapActions('cruiseView', [
      'redraw',
    ]),
    drawPalette() {
      const min = this.sliderValues[0]; const max = this.sliderValues[1];
      const width = 500; const height = 35;
      const palette = this.colorPalettes[this.selectedPalette];
      this.colorValueArray = d3.range(
        min,
        max,
        (max - min) / palette.length,
      );
      this.$store.dispatch('cruiseView/updateColorScaleFunction',
        scaleOrdinal().domain(this.colorValueArray).range(palette));

      d3.select('#colorPalette').selectAll('*').remove();
      const svg = d3.select('#colorPalette')
        .append('svg')
        .attr('height', height)
        .attr('width', width);

      svg.selectAll('.bars')
        .data(range(palette.length), (d) => d)
        .enter()
        .append('rect')
        .attr('class', 'bars')
        .attr('x', (i) => ((i * width) / palette.length))
        .attr('y', 0)
        .attr('width', width / palette.length)
        .attr('height', height)
        .style('fill', (d) => this.colorScaleFunction(d));

      svg.selectAll('rect')
        .on('mouseover', this.handleMouseOver)
        .on('mouseout', this.handleMouseOut);
    },
    onPaletteChange() {
      this.drawPalette();
      this.redraw();
    },
    handleMouseOver(d) {
      const minVal = this.sliderValues[0]; const maxVal = this.sliderValues[1];
      const palette = this.colorPalettes[this.selectedPalette];
      const printValLeft = ((maxVal - minVal) / palette.length) * d + minVal;
      const printValRight = printValLeft + (maxVal - minVal) / palette.length;
      d3.select('#colorPaletteValue')
        .html(`Highlighted Value Range: <b>${String(printValLeft.toFixed(2))}</b> to <b>${String(printValRight.toFixed(2))}</b> dB`);
    },
    handleMouseOut() {
      d3.select('#colorPaletteValue').text('...');
    },
  },

  mounted() {
    this.drawPalette();
  },

  computed: {
    ...mapState('cruiseView', [
      'colorPalettes',
      'sliderValues',
    ]),
    selectedPalette: { // v-model requires getter & setter
      get() {
        return store.state.cruiseView.selectedPalette;
      },
      set(value) {
        this.$store.dispatch('cruiseView/updateSelectedPalette', value);
      },
    },
    colorScaleFunction: {
      get() {
        return store.state.cruiseView.colorScaleFunction;
      },
      set(func) {
        this.$store.dispatch('cruiseView/updateColorScaleFunction', func);
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
};
</script>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped />
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style>
    .palette {
        display: block;
        margin-left: auto; margin-right: auto;
        width: 30%;
    }
    .bars:hover { opacity: 0.75; }
</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
