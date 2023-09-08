<template>
  <div class="echogram-container">
    <div ref="map" />
    <!--    <l-map-->
    <!--      v-if="center.length"-->
    <!--      :crs="CRS.Simple"-->
    <!--      :zoom="zoom"-->
    <!--      :center="center"-->
    <!--      :minZoom="0"-->
    <!--      :maxZoom="0"-->
    <!--      :maxBounds="maxBounds"-->
    <!--      @click="cursorUpdated"-->
    <!--      @update:center="mapCenterUpdated"-->
    <!--      :options="{ zoomControl: false }"-->
    <!--    >-->
    <!--      <l-marker v-if="svVisible" :lat-lng="svMarker" />-->
    <!--      <l-grid-layer :tileSize="512" />-->
    <!--      <l-control-zoom position="bottomright" />-->
    <!--    </l-map>-->
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import L, {
  Coords, DoneCallback, GridLayerOptions, LatLngTuple, LeafletMouseEvent, Point, TileEvent, TileEventHandlerFn,
} from 'leaflet';
import {
  computed, onMounted, ref, watch, reactive,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  HTTPStore, openArray, ZarrArray, slice, NestedArray,
} from 'zarr';
import { ZARR_BASE_URL } from '@/basePath';
import { color } from 'd3-color';
import { scaleLinear, scaleThreshold } from 'd3-scale';
import * as d3 from 'd3';
import { colorPalettes, defaultColorPalette } from '@/views/view/echofish/cruise/WaterColumnColors';
import { RawArray } from 'zarr/types/rawArray';
import lIcon from 'leaflet/dist/images/marker-icon.png';

const props = defineProps<{
  shipName: string;
  cruiseName: string;
  sensorName: string;
  storeIndex: number;
  depthIndex: number;
  frequency: number;
}>();

const router = useRouter();
const zoom = ref(0);
const center = ref<LatLngTuple | undefined>();
const maxBounds = ref([[0, 0], [0, 0]]);
const svMarker = ref<L.LatLng | undefined>();
const map = ref(null);
const shipName = computed(() => props.shipName);
const cruiseName = computed(() => props.cruiseName);
const sensorName = computed(() => props.sensorName);
const storeIndex = computed(() => props.storeIndex);
const depthIndex = computed(() => props.depthIndex);
const frequency = computed(() => props.frequency);
const sliderValues = ref([-80, -30]);
const selectedColorPalette = ref(defaultColorPalette);

const depthArray = ref<ZarrArray | undefined>();
const timeArray = ref<ZarrArray | undefined>();
const latitudeArray = ref<ZarrArray | undefined>();
const longitudeArray = ref<ZarrArray | undefined>();
const frequencyArray = ref<ZarrArray | undefined>();
const svArray = ref<ZarrArray | undefined>();

const frequencies = ref<number[]>([]);

const visibleCanvases = reactive(new Map<string, HTMLCanvasElement>());
const lMap = ref<L.Map | undefined>();
const marker = ref<L.Marker | undefined>();

watch(svMarker, (newValue, oldValue) => {
  if (newValue && lMap.value) {
    if (!oldValue) {
      marker.value = L.marker(newValue, { icon: L.icon({ iconUrl: lIcon }) });
      marker.value?.addTo(lMap.value);
    } else {
      marker.value?.setLatLng(newValue);
    }
  }
});

function drawTile(key: string, canvas: HTMLCanvasElement) {
  const parts = key.split('_');
  const x = Number.parseInt(parts[0], 10);
  const y = Number.parseInt(parts[1], 10);
  const z = Number.parseInt(parts[2], 10);
  if (svArray.value && frequencies.value.length) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dataDimension = svArray.value.meta.shape;

      const maxBoundsX = Math.abs(dataDimension[1]);
      const maxBoundsY = Math.abs(dataDimension[0]);

      const maxBoundsValue = [[-1 * Math.ceil(dataDimension[0] / 512) * 512, 0], [0, Math.ceil(dataDimension[1] / 512) * 512]];
      const maxTileBoundsX = Math.abs(maxBoundsValue[1][1]) / 512;
      const maxTileBoundsY = Math.abs(maxBoundsValue[0][0]) / 512;

      const indicesLeft = 512 * x;
      const indicesRight = Math.min(512 * x + 512, maxBoundsX);
      const indicesTop = 512 * y;
      const indicesBottom = Math.min(512 * y + 512, maxBoundsY);

      const min = sliderValues.value[0];
      const max = sliderValues.value[1];
      const palette = (colorPalettes as any)[selectedColorPalette.value] as string[];
      const greyMapFunc = scaleLinear().domain([min, max]).range([0, 255]).clamp(true);
      const colorfunc = scaleThreshold()
        .domain(d3.range(0, 255, 255 / palette.length))
        .range(palette);

      if (y >= maxTileBoundsY || y < 0 || x < 0 || x >= maxTileBoundsX) {
        ctx.font = '14px serif';
        ctx.fillText(`{${x}, ${y}, ${z}}`, 20, 40);
        ctx.strokeStyle = '#07a30c';
        ctx.beginPath();
        ctx.rect(10, 10, 502, 502);
        ctx.stroke();
        return;
      }

      svArray.value.getRaw([slice(indicesTop, indicesBottom), slice(indicesLeft, indicesRight), frequencies.value.indexOf(frequency.value)])
        .then((d1) => {
          const d = d1 as RawArray;
          const [height, width] = d.shape;
          const uintc8 = new Uint8ClampedArray(d.data.length * 4).fill(255);

          for (let i = 0; i < d.data.length; i++) {
            if (!Number.isNaN(d.data[i]) && d.data[i] > min && d.data[i] < max) {
            // if (!Number.isNaN(parseFloat(d.data[i])) && d.data[i] > min && d.data[i] < max) {
              const pixelColor = color(colorfunc(greyMapFunc(d.data[i])).substring(0, 7));
              uintc8[i * 4] = pixelColor.r;
              uintc8[i * 4 + 1] = pixelColor.g;
              uintc8[i * 4 + 2] = pixelColor.b;
            }
          }
          ctx.putImageData(new ImageData(uintc8, width, height), 0, 0);
        });
    }
  }
}

function cursorUpdated(e: LeafletMouseEvent) {
  const cursorLocation = e.latlng;
  svMarker.value = cursorLocation;
  this.updateCursorValues({
    storeIndex: Math.floor(cursorLocation.lng),
    depthMeters: cursorLocation.lat.toFixed(2),
  });

  this.onSelectPoint({
    lat: this.selectedLat,
    lon: this.selectedLon,
    epochMillis: this.selectedTimestampMillis,
    depthMeters: this.selectedDepthMeters,
  });
  this.toggleSidebar();
}

onMounted(() => {
  center.value = [-1 * depthIndex.value, storeIndex.value];
  if (map.value) {
    lMap.value = L.map(map.value, {
      crs: L.CRS.Simple,
      zoom: zoom.value,
      center: center.value,
      minZoom: 0,
      maxZoom: 0,
      zoomControl: false,
    });
    lMap.value.addControl(new L.Control.Zoom({ position: 'bottomright' }));

    lMap.value.on('click', cursorUpdated);

    const Custom = L.GridLayer.extend({

      getTileSize(): L.Point {
        return new L.Point(512, 512);
      },

      createTile(coords: Coords) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const key1 = `${coords.x}_${coords.y}_${coords.z}`;
        visibleCanvases.set(key1, canvas);
        drawTile(key1, canvas);
        return canvas;
      },
    });

    const layer = new Custom();
    layer.on('tileunload', (event: TileEvent) => {
      const coords = event.coords;
      visibleCanvases.delete(`${coords.x}_${coords.y}_${coords.z}`);
    });

    lMap.value.addLayer(layer);
  }

  const store = new HTTPStore(`${ZARR_BASE_URL}/level_2/${shipName.value}/${cruiseName.value}/${sensorName.value}/${cruiseName.value}.zarr`);
  const depthPromise = openArray({ store, path: 'depth', mode: 'r' });
  const timePromise = openArray({ store, path: 'time', mode: 'r' });
  const latitudePromise = openArray({ store, path: 'latitude', mode: 'r' });
  const longitudePromise = openArray({ store, path: 'longitude', mode: 'r' });
  const frequencyPromise = openArray({ store, path: 'frequency', mode: 'r' });
  const svPromise = openArray({ store, path: 'Sv', mode: 'r' });

  Promise.all([
    depthPromise,
    timePromise,
    latitudePromise,
    longitudePromise,
    frequencyPromise,
    svPromise,
  ]).then(([depthArray1, timeArray1, latitudeArray1, longitudeArray1, frequencyArray1, svArray1]) => {
    depthArray.value = depthArray1;
    timeArray.value = timeArray1;
    latitudeArray.value = latitudeArray1;
    longitudeArray.value = longitudeArray1;
    frequencyArray.value = frequencyArray1;
    svArray.value = svArray1;
    return frequencyArray1.get();
  }).then((nestedArray: any) => Array.from(nestedArray.data))
    .then((freq) => {
      frequencies.value = freq as number[];
      visibleCanvases.forEach((canvas, key) => {
        drawTile(key, canvas);
      });
    });
});

function onMoveEchogram(nextStoreIndex: number, nextDepthIndex: number) {
  router.push({
    name: 'cruise',
    params: {
      shipName: shipName.value,
      cruiseName: cruiseName.value,
      sensorName: sensorName.value,
      storeIndex: nextStoreIndex,
      depthIndex: nextDepthIndex,
      frequency: frequency.value,
    },
  });
}

function mapCenterUpdated(c: any) {
  console.log(c);
  if (c && svArray.value) {
    const nextStoreIndex = Math.min(Math.round(c.lng), svArray.value.shape[1]);
    const nextDepthIndex = Math.min(Math.round(-1 * c.lat), svArray.value.shape[0]);
    onMoveEchogram(nextStoreIndex, nextDepthIndex);
  }
}

// function updateCursorValues() {
//   const depthAbs = Math.abs(parseFloat(depthMeters));
//   const latitude = latitudeArray.value?.get(slice(storeIndex.value, storeIndex.value + 1)).then((z: any) => (Array.from((z).data)[0] as number).toFixed(5));
//   const longitude = longitudeArray.value?.get(slice(storeIndex.value, storeIndex.value + 1)).then((z: any) => (Array.from(z.data)[0] as number).toFixed(5));
//   const timestamp = timeArray.value?.get(slice(storeIndex.value, storeIndex.value + 1)).then((z: any) => (Array.from(z.data)[0] as number));
//   const data = svArray.value?.getRaw([slice(depthAbs, depthAbs + 1), slice(storeIndex.value, storeIndex.value + 1), 0]).then((z) => z);
//   const dataSlice = svArray.value?.getRaw([slice(depthAbs, depthAbs + 1), slice(storeIndex.value, storeIndex.value + 1), null]).then((z) => z);
//   // dataSlice will be used for plotting the line graph
//
//   Promise.all([timestamp, latitude, longitude, data, dataSlice])
//     .then((x) => {
//     // ({time: x[0], lat: x[1], lon: x[2]})
//       commit('selectedTimestampMillis', x[0]);
//       commit('selectedLat', x[1]);
//       commit('selectedLon', x[2]);
//       commit('selectedDepthMeters', depthMeters);
//       commit('selectedDataValue', Array.from(x[3].data)[0]); // TODO: is this correct for selected frequency?
//       commit('selectedDataSlice', Array.from(x[4].data));
//     });
// }

</script>
