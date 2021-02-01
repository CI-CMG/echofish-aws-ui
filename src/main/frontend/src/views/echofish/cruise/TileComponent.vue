<template>
  <canvas ref="canvas" width="512" height="512"></canvas>
</template>

<script>
import { mapGetters } from 'vuex';
import { slice } from 'zarr';

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

      // console.log({
      //   indicesLeft, indicesRight, indicesTop, indicesBottom,
      // });

      if (this.drawContext.y >= maxTileBoundsY || this.drawContext.y < 0 || this.drawContext.x < 0 || this.drawContext.x >= maxTileBoundsX) {
        ctx.font = '14px serif';
        ctx.fillText(`{${this.drawContext.x}, ${this.drawContext.y}, ${this.drawContext.z}}`, 20, 50);
        ctx.strokeStyle = '#07a30c';
        ctx.beginPath();
        ctx.rect(10, 10, 502, 502);
        ctx.stroke();
        return;
      }
      this.zarr.dataArray.getRaw([slice(indicesTop, indicesBottom), slice(indicesLeft, indicesRight), this.frequencies.indexOf(this.selectedFrequency)])
        .then((d) => {
          const [height, width] = d.shape;
          const uintc8 = new Uint8ClampedArray(d.data.length * 4);
          let pixelValue = 255;

          for (let i = 0; i < d.data.length; i++) {
            if (Number.isNaN(parseFloat(d.data[i]))) {
              pixelValue = 255;
            } else {
              pixelValue = 255 - (Math.abs(d.data[i]) / 100) * 255; // TODO: color here!
            }
            uintc8[i * 4] = pixelValue;
            uintc8[i * 4 + 1] = pixelValue;
            uintc8[i * 4 + 2] = pixelValue;
            uintc8[i * 4 + 3] = 255;
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
    }),
    drawContext() {
      return {
        y: this.coords.y,
        x: this.coords.x,
        z: this.coords.z,
      };
    },
  },
};
</script>
