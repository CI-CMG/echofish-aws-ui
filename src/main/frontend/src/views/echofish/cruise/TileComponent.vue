<template>
  <canvas ref="canvas" width="512" height="512"></canvas>
</template>

<script>
import { mapGetters } from 'vuex';
import { slice } from 'zarr';
import { color } from 'd3-color';
import { scaleLinear, scaleThreshold } from 'd3-scale';
import * as d3 from 'd3';

export default {

  props: ['coords'],

  data() {
    return {
      imageData: null,
      canvas: null,
    };
  },

  methods: {
    drawTile() {
      const ctx = this.$refs.canvas.getContext('2d');
      const dataDimension = this.zarr.dataArray.meta.shape;

      const maxBoundsX = Math.abs(dataDimension[1]);
      const maxBoundsY = Math.abs(dataDimension[0]);

      const maxBoundsValue = [[-1 * Math.ceil(dataDimension[0] / 512) * 512, 0], [0, Math.ceil(dataDimension[1] / 512) * 512]];
      const maxTileBoundsX = Math.abs(maxBoundsValue[1][1]) / 512;
      const maxTileBoundsY = Math.abs(maxBoundsValue[0][0]) / 512;

      const indicesLeft = 512 * this.drawContext.x;
      const indicesRight = Math.min(512 * this.drawContext.x + 512, maxBoundsX);
      const indicesTop = 512 * this.drawContext.y;
      const indicesBottom = Math.min(512 * this.drawContext.y + 512, maxBoundsY);

      const min = this.sliderValues[0];
      const max = this.sliderValues[1];
      const palette = this.colorPalettes[this.selectedColorPalette];
      const greyMapFunc = scaleLinear().domain([min, max]).range([0, 255]).clamp(true);
      const colorfunc = scaleThreshold()
        .domain(d3.range(0, 255, 255 / palette.length))
        .range(this.colorPalettes[this.selectedColorPalette]);

      // console.log({ indicesLeft, indicesRight, indicesTop, indicesBottom });

      if (this.drawContext.y >= maxTileBoundsY || this.drawContext.y < 0 || this.drawContext.x < 0 || this.drawContext.x >= maxTileBoundsX) {
        ctx.font = '14px serif';
        ctx.fillText(`{${this.drawContext.x}, ${this.drawContext.y}, ${this.drawContext.z}}`, 20, 40);
        ctx.strokeStyle = '#07a30c';
        ctx.beginPath();
        ctx.rect(10, 10, 502, 502);
        ctx.stroke();
        return;
      }

      this.zarr.dataArray.getRaw([slice(indicesTop, indicesBottom), slice(indicesLeft, indicesRight), this.frequencies.indexOf(this.selectedFrequency)])
        .then((d) => {
          const [height, width] = d.shape;
          const uintc8 = new Uint8ClampedArray(d.data.length * 4).fill(255);

          for (let i = 0; i < d.data.length; i++) {
            if (!Number.isNaN(parseFloat(d.data[i])) && d.data[i] > min && d.data[i] < max) {
              const pixelColor = color(colorfunc(greyMapFunc(d.data[i])).substring(0, 7));
              uintc8[i * 4] = pixelColor.r;
              uintc8[i * 4 + 1] = pixelColor.g;
              uintc8[i * 4 + 2] = pixelColor.b;
            }
          }
          ctx.putImageData(new ImageData(uintc8, width, height), 0, 0);
        });
    },
  },

  mounted() {
    this.drawTile();
  },

  computed: {
    ...mapGetters({
      selectedFrequency: 'cruiseView/selectedFrequency',
      frequencies: 'cruiseView/frequencies',
      zarr: 'cruiseView/zarr',
      cruise: 'cruiseView/cruise',
      colorValueArray: 'cruiseView/colorValueArray',
      sliderValues: 'cruiseView/sliderValues',
      colorPalettes: 'cruiseView/colorPalettes',
      selectedColorPalette: 'cruiseView/selectedColorPalette',
    }),
    drawContext() {
      return {
        y: this.coords.y,
        x: this.coords.x,
        z: this.coords.z,
        selectedFrequency: this.selectedFrequency,
        sliderValues: this.sliderValues,
        selectedColorPalette: this.selectedColorPalette,
        cruise: this.cruise,
      };
    },
  },

  watch: {
    drawContext() {
      this.drawTile();
    },
  },
};
</script>
