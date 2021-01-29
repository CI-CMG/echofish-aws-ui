<template>
  <canvas ref="canvas" width="512" height="512"></canvas>
</template>
<script>

import { mapGetters } from 'vuex';
import { slice } from 'zarr';
import LRU from 'lru-cache';

const length = 512 * 512 * 4;

const tileCache = new LRU(20);

const createKey = ({
  y, x, cruise, selectedFrequency,
}) => `${cruise}:${selectedFrequency}:${x}:${y}`;

export default {
  props: ['coords'],
  methods: {
    drawTile() {
      const ctx = this.$refs.canvas.getContext('2d');

      const key = createKey(this.drawContext);
      let imageData = tileCache.get(key);
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
        return;
      }

      const {
        y, x, selectedFrequency,
      } = this.drawContext;

      const depth = y * 512;
      const index = x * 512;
      const freq = this.frequencies.indexOf(selectedFrequency);

      const top = depth;
      const bottom = Math.min(top + 512, this.zarr.dataArray.shape[0]);
      const left = index;
      const right = Math.min(left + 512, this.zarr.dataArray.shape[1]);

      this.zarr.dataArray.get([slice(top, bottom), slice(left, right), freq])
        .then(({ data, shape }) => {
          const [height, width] = shape;

          const uintc8 = new Uint8ClampedArray(length);
          let i = 0;
          for (let colIndex = 0; colIndex < 512; colIndex++) {
            for (let pointIndex = 0; pointIndex < 512; pointIndex++) {
              if (colIndex >= height || pointIndex >= width) {
                uintc8[i * 4] = 255;
                uintc8[i * 4 + 1] = 0;
                uintc8[i * 4 + 2] = 0;
                uintc8[i * 4 + 3] = 255;
              } else {
                const point = data[colIndex][pointIndex];
                uintc8[i * 4] = 255 - Math.abs(point);
                uintc8[i * 4 + 1] = 255 - Math.abs(point);
                uintc8[i * 4 + 2] = 255 - Math.abs(point);
                uintc8[i * 4 + 3] = 255;
              }
              i++;
            }
          }
          imageData = new ImageData(uintc8, 512, 512);
          tileCache.set(key, imageData);
          ctx.putImageData(imageData, 0, 0);
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
        selectedFrequency: this.selectedFrequency,
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
