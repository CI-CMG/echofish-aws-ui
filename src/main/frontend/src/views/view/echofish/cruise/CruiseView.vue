<template>
  <div class="cruise-container">
    <feature-detail-drawer
      :cruise-name="cruiseName"
      :ship-name="shipName"
      :sensor-name="sensorName"
      @open-close-drawer="openCloseInfoDrawer"
      :drawer="drawer"
      :frequencies="frequencies"
      :selected-echogram-point="selectedEchogramPoint"
    />
    <echogram
      :sensor-name="sensorName"
      :cruise-name="cruiseName"
      :depth-index="depthIndex"
      :store-index="storeIndex"
      :ship-name="shipName"
      :frequency="frequency"
      @update-frequencies="updateFrequencies"
      @update-selected-point="updateSelectedEchogramPoint"
    />
    <v-container style="position: absolute; top: 0; left: 0; right: 0;" fluid class="pa-0">
      <v-row no-gutters>
        <v-col cols="3">
          <v-btn v-if="!drawer" color="secondary" class="ma-2" rounded @click="openCloseInfoDrawer">
            <span>{{shipName}} {{cruiseName}} {{sensorName}}</span>
            <v-icon icon="mdi-information-outline" />
          </v-btn>
        </v-col>
        <v-col cols="9" class="d-flex justify-end">
          <v-card variant="text">
            <v-card-actions class="justify-center">
              <v-tooltip location="bottom" text="Go To Map">
                <template #activator="{ props }">
                  <v-btn v-bind="props" rounded variant="flat" color="secondary" icon="mdi-earth" @click="goToMap" />
                </template>
              </v-tooltip>
              <!--              <v-tooltip location="bottom" text="Toggle 2D / 3D">-->
              <!--                <template #activator="{ props }">-->
              <!--                  <v-btn-->
              <!--                      v-bind="props"-->
              <!--                      variant="flat"-->
              <!--                      :icon="twoDimensional ? 'mdi-earth' : 'mdi-earth-box'"-->
              <!--                      color="secondary"-->
              <!--                      @click="twoDimensional = !twoDimensional"-->
              <!--                      :disabled="flyTo && flyTo.destinationIsPolar ? flyTo.destinationIsPolar : false"-->
              <!--                  />-->
              <!--                </template>-->
              <!--              </v-tooltip>-->
              <!--              <v-menu-->
              <!--                  :close-on-content-click="false"-->
              <!--                  v-model="measureToolMenu"-->
              <!--                  :width="300"-->
              <!--                  :persistent="true"-->
              <!--                  :no-click-animation="true"-->
              <!--              >-->
              <!--                <template v-slot:activator="{ props }">-->
              <!--                  <v-btn color="secondary" class="v-btn&#45;&#45;icon" v-bind="props" variant="flat">-->
              <!--                    <v-icon icon="mdi-ruler" />-->
              <!--                    <v-tooltip location="bottom" activator="parent">Measure Tool</v-tooltip>-->
              <!--                  </v-btn>-->
              <!--                </template>-->
              <!--                <v-card>-->
              <!--                  <v-card-title>Measure Tool</v-card-title>-->
              <!--                  <v-card-text>-->
              <!--                    <v-list>-->
              <!--                      <v-list-item v-for="(key, i) in measureLinesKeys" :key="i">-->
              <!--                        <v-row no-gutters align="center" class="pt-1 pb-1">-->
              <!--                          <v-col class="text-left">-->
              <!--                            <v-badge v-if="key === activeMeasureLineId" dot color="success">-->
              <!--                              <v-avatar variant="tonal" :color="measureLines[key]?.color.toCssColorString()">-->
              <!--                                {{ i + 1 }}-->
              <!--                              </v-avatar>-->
              <!--                            </v-badge>-->
              <!--                            <v-avatar style="cursor: pointer;" v-else variant="tonal" :color="measureLines[key]?.color.toCssColorString()" @click="setActiveMeasureLine(key)">-->
              <!--                              {{ i + 1 }}-->
              <!--                            </v-avatar>-->
              <!--                          </v-col>-->
              <!--                          <v-col class="text-center" style="min-width: 150px;">-->
              <!--                            {{ measureLines[key]?.distance ? measureLines[key]?.distance : '0 m' }}-->
              <!--                          </v-col>-->
              <!--                          <v-col class="text-right">-->
              <!--                            <v-btn color="secondary" icon="mdi-minus" variant="text" size="small" @click="removeMeasureLine(key)" />-->
              <!--                          </v-col>-->
              <!--                        </v-row>-->
              <!--                      </v-list-item>-->
              <!--                    </v-list>-->
              <!--                    <v-btn icon="mdi-plus" :disabled="measureLinesKeys.length >= 5" @click="addMeasureLine" variant="text" size="small" />-->
              <!--                  </v-card-text>-->
              <!--                </v-card>-->
              <!--              </v-menu>-->

              <!--              <v-menu :close-on-content-click="false" v-model="dialog">-->
              <!--                <template v-slot:activator="{ props }">-->
              <!--                  <v-btn-->
              <!--                      class="v-btn&#45;&#45;icon"-->
              <!--                      variant="flat"-->
              <!--                      color="secondary"-->
              <!--                      v-bind="props"-->
              <!--                  >-->
              <!--                    <v-icon icon="mdi-layers" />-->
              <!--                    <v-tooltip location="bottom" activator="parent">Map Layers & Settings</v-tooltip>-->
              <!--                  </v-btn>-->
              <!--                </template>-->
              <!--                <v-card density="compact">-->
              <!--                  <v-card-text>-->
              <!--                    <v-container>-->
              <!--                      <v-select-->
              <!--                          density="compact"-->
              <!--                          v-model="baseLayer"-->
              <!--                          :items="items"-->
              <!--                          item-title="name"-->
              <!--                          item-value="value"-->
              <!--                          label="Select"-->
              <!--                          variant="solo"-->
              <!--                      />-->
              <!--                      <v-checkbox density="compact" v-model="bMosaic" label="DCDB Multibeam Bathymetry Mosaic" />-->
              <!--                      <v-checkbox density="compact" v-model="contours" label="GEBCO Contours" />-->
              <!--                      <v-checkbox density="compact" v-model="countries" label="World Boundaries and Places" />-->
              <!--                      <v-checkbox density="compact" v-model="graticule" label="Graticule" />-->
              <!--                      <v-switch density="compact" :label="`Coordinate Units: ${decimalCoordinates ? 'Decimal degrees' : 'Degrees, Minutes'}`" v-model="decimalCoordinates" />-->
              <!--                    </v-container>-->
              <!--                  </v-card-text>-->
              <!--                  <v-card-actions>-->
              <!--                    <v-spacer />-->
              <!--                    <v-btn @click="dialog = false" prepend-icon="mdi-close-circle" color="secondary">Close</v-btn>-->
              <!--                  </v-card-actions>-->
              <!--                </v-card>-->
              <!--              </v-menu>-->
            </v-card-actions>
            <!--            <v-card-actions class="justify-center">-->
            <!--              <polar-view-menu :fly-to="flyTo" :disabled="twoDimensional" @flyToPole="updateFlyTo" />-->
            <!--            </v-card-actions>-->
          </v-card>
        </v-col>
      </v-row>
    </v-container>

  </div>
</template>

<script setup lang="ts">
import { Router, useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';
// import {
//   openArray, HTTPStore,
// } from 'zarr';
// import { ZARR_BASE_URL } from '@/basePath';
import Echogram from '@/views/view/echofish/cruise/Echogram.vue';
import FeatureDetailDrawer from '@/views/view/echofish/cruise/FeatureDetailDrawer.vue';
import SelectedEchogramPoint from '@/views/view/echofish/cruise/SelectedEchogramPoint';

// type ViewState = {
//   frequencies?: number[];
// };

const route = useRoute();
const shipName = computed(() => route.params.shipName as string);
const cruiseName = computed(() => route.params.cruiseName as string);
const sensorName = computed(() => route.params.sensorName as string);
const storeIndex = computed(() => Number.parseInt(route.params.storeIndex as string, 10));
const depthIndex = computed(() => Number.parseInt(route.params.depthIndex as string, 10));
const frequency = computed(() => Number.parseInt(route.params.frequency as string, 10));
const drawer = ref(true);
const frequencies = ref<number[]>([]);
const selectedEchogramPoint = ref<SelectedEchogramPoint | undefined>();
const router: Router = useRouter();

function openCloseInfoDrawer() {
  drawer.value = !drawer.value;
}

function updateFrequencies(newFrequencies: number[]) {
  frequencies.value = newFrequencies;
}

function updateSelectedEchogramPoint(newEchogramPoint: SelectedEchogramPoint | undefined) {
  selectedEchogramPoint.value = newEchogramPoint;
}

function goToMap() {
  router.push({
    name: 'map',
  });
}

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// function load() {
//   const store = new HTTPStore(`${ZARR_BASE_URL}/level_2/${shipName.value}/${cruiseName.value}/${sensorName.value}/${cruiseName.value}.zarr`);
//   openArray({ store, path: 'frequency', mode: 'r' })
//     .then((frequencyArray) => frequencyArray.get())
//     .then((nestedArray: any) => Array.from(nestedArray.data))
//     .then((frequencyArray) => {
//       console.log(frequencyArray);
//       const state: ViewState = {
//         frequencies: frequencyArray as number[],
//       };
//       return state;
//     })
//     .then((state) => {
//       frequencies.value = state.frequencies || [];
//     });
// }
//
// watch(shipName, () => load());
// watch(cruiseName, () => load());
// watch(sensorName, () => load());
// watch(storeIndex, () => load());
// watch(depthIndex, () => load());
// watch(frequency, () => load());

</script>
