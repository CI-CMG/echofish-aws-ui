<template>
  <v-navigation-drawer :width="500" :model-value="drawer" @update:model-value="close" temporary :scrim="false" disable-route-watcher>
    <template v-slot:prepend>
      <v-container>
        <v-row align="center" no-gutters>
          <v-col class="text-left">
            <h3>{{ shipName }} {{ cruiseName }} {{ sensorName }}</h3>
          </v-col>
          <v-col class="text-right" cols="3">
            <v-btn
              variant="text"
              icon="mdi-chevron-left"
              @click="close()"
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
    <v-card variant="flat">
      <v-card-text>
        <v-row no-gutters>
          <div class="echogram-globe">
            <cesium-map />
          </div>
        </v-row>
        <v-row no-gutters>
          <multi-frequency-plot :frequencies="frequencies" :selected-data-slice="selectedDataSlice" />
        </v-row>
        <v-row no-gutters v-if="utcTime">
          <v-col cols="4">Time (GMT):</v-col>
          <v-col>{{utcTime}}</v-col>
        </v-row>
        <v-row no-gutters v-if="localTime">
          <v-col cols="4">Time At Location:</v-col>
          <v-col>{{localTime}}</v-col>
        </v-row>
        <v-row no-gutters v-if="selectedEchogramPoint?.longitude != undefined && selectedEchogramPoint?.latitude != undefined">
          <v-col cols="4">Location:</v-col>
          <v-col>{{`${selectedEchogramPoint.longitude.toFixed(3)} E/W, ${selectedEchogramPoint.latitude.toFixed(3)} N/S`}}</v-col>
        </v-row>
        <v-row no-gutters v-if="selectedEchogramPoint?.depthMeters != undefined">
          <v-col cols="4">Depth (m):</v-col>
          <v-col>{{-selectedEchogramPoint.depthMeters}}</v-col>
        </v-row>
        <v-row no-gutters v-if="selectedEchogramPoint?.sv != undefined">
          <v-col cols="4">Selected (Sv):</v-col>
          <v-col>{{selectedEchogramPoint.sv}} dB</v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import CesiumMap from '@/views/view/echofish/map/CesiumMap.vue';
import MultiFrequencyPlot from '@/views/view/echofish/cruise/MultiFrequencyPlot.vue';
import SelectedEchogramPoint from '@/views/view/echofish/cruise/SelectedEchogramPoint';
import { computed } from 'vue';
import moment from 'moment-timezone';
import tzlookup from 'tz-lookup';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps< {
  drawer: boolean;
  shipName: string,
  cruiseName: string,
  sensorName: string,
  frequencies: number[],
  selectedEchogramPoint?: SelectedEchogramPoint,
}>(), {
  selectedEchogramPoint: undefined,
});

const emit = defineEmits(['openCloseDrawer']);

const close = () => {
  emit('openCloseDrawer', false);
};

const selectedDataSlice = computed(() => (props.selectedEchogramPoint ? props.selectedEchogramPoint.dataSlice : []));

const getDateTime = (epochSeconds: number, timezone: string) => {
  const tempDate = new Date(0);
  tempDate.setUTCMilliseconds(epochSeconds * 1000);
  const timestamp = tempDate.toISOString().substring(0, 19);
  return moment.tz(timestamp, 'Etc/UTC').clone().tz(`${timezone}`);
};

const utcTime = computed(() => {
  if (props.selectedEchogramPoint?.timestamp !== undefined) {
    return getDateTime(props.selectedEchogramPoint.timestamp, 'Etc/UTC');
  }
  return undefined;
});

const localTime = computed(() => {
  if (props.selectedEchogramPoint?.timestamp !== undefined && props.selectedEchogramPoint?.longitude !== undefined && props.selectedEchogramPoint?.latitude !== undefined) {
    return getDateTime(props.selectedEchogramPoint.timestamp, tzlookup(props.selectedEchogramPoint.latitude, props.selectedEchogramPoint.longitude));
  }
  return undefined;
});

</script>
