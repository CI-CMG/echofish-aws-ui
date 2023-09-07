<template>
  <div class="cruise-container">
    <echogram :sensor-name="sensorName" :cruise-name="cruiseName" :depth-index="depthIndex" :store-index="storeIndex" :ship-name="shipName" :frequency="frequency" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, watch } from 'vue';
import {
  openArray, HTTPStore,
} from 'zarr';
import { ZARR_BASE_URL } from '@/basePath';
import Echogram from '@/views/view/echofish/cruise/Echogram.vue';

type ViewState = {
  frequencies?: number[];
};

const route = useRoute();
const shipName = computed(() => route.params.shipName as string);
const cruiseName = computed(() => route.params.cruiseName as string);
const sensorName = computed(() => route.params.sensorName as string);
const storeIndex = computed(() => Number.parseInt(route.params.storeIndex as string, 10));
const depthIndex = computed(() => Number.parseInt(route.params.depthIndex as string, 10));
const frequency = computed(() => Number.parseInt(route.params.frequency as string, 10));

const frequencies = ref<number[]>([]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function load() {
  const store = new HTTPStore(`${ZARR_BASE_URL}/level_2/${shipName.value}/${cruiseName.value}/${sensorName.value}/${cruiseName.value}.zarr`);
  openArray({ store, path: 'frequency', mode: 'r' })
    .then((frequencyArray) => frequencyArray.get())
    .then((nestedArray: any) => Array.from(nestedArray.data))
    .then((frequencyArray) => {
      const state: ViewState = {
        frequencies: frequencyArray as number[],
      };
      return state;
    })
    .then((state) => {
      frequencies.value = state.frequencies || [];
    });
}

watch(shipName, () => load());
watch(cruiseName, () => load());
watch(sensorName, () => load());
watch(storeIndex, () => load());
watch(depthIndex, () => load());
watch(frequency, () => load());

</script>
