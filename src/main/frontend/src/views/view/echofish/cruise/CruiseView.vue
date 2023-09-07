<template>
  <div class="cruise-container">
    {{ route.params }}
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, watch } from 'vue';
import {
  openArray, HTTPStore,
} from 'zarr';
import { ZARR_BASE_URL } from '@/basePath';

const route = useRoute();
const shipName = computed(() => route.params.shipName);
const cruiseName = computed(() => route.params.cruiseName);
const sensorName = computed(() => route.params.sensorName);
const storeIndex = computed(() => route.params.storeIndex);
const depthIndex = computed(() => route.params.depthIndex);
const frequency = computed(() => route.params.frequency);

const frequencies = ref<number[]>([]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function load() {

}

watch(shipName, () => load());
watch(cruiseName, () => load());
watch(sensorName, () => load());
watch(storeIndex, () => load());
watch(depthIndex, () => load());
watch(frequency, () => load());

</script>
