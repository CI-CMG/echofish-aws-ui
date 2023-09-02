<template>
  <render />
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import {
  onMounted, ref, watch,
} from 'vue';
import WidgetEventContext from '../api/WidgetEventContext';

// TODO events
const props = withDefaults(defineProps< {
  csEvents: WidgetEventContext;
  name: string;
  index: number;
  clustering?: Cesium.EntityCluster;
  show?: boolean;
  // load options
  data: Cesium.Resource | string;
  sourceUri?: string;
  // TODO
  // describe:
  markerSize?: number;
  markerSymbol?: string;
  markerColor?: Cesium.Color;
  stroke?: Cesium.Color;
  strokeWidth?: number;
  fill?: Cesium.Color;
  clampToGround?: boolean;
  credit?: Cesium.Credit | string;
}>(), {
  clustering: undefined,
  show: undefined,
  sourceUri: undefined,
  markerSize: undefined,
  markerSymbol: undefined,
  markerColor: undefined,
  stroke: undefined,
  strokeWidth: undefined,
  fill: undefined,
  clampToGround: undefined,
  credit: undefined,
});

const dataSource = ref<Cesium.GeoJsonDataSource | undefined>();
const needNewDataSource = ref(false);
const needLoadDataSource = ref(false);

const loadDataSource = () => {
  needLoadDataSource.value = false;
  if (dataSource.value) {
    dataSource.value.load(props.data, {
      sourceUri: props.sourceUri,
      markerSize: props.markerSize,
      markerSymbol: props.markerSymbol,
      markerColor: props.markerColor,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      fill: props.fill,
      clampToGround: props.clampToGround,
      credit: props.credit,
    });
  }
};

const updateDataSource = () => {
  dataSource.value = new Cesium.GeoJsonDataSource(props.name);
  loadDataSource();
  props.csEvents.updateDataSource(dataSource.value, props.index);
  needNewDataSource.value = false;
};

watch(needNewDataSource, (newValue) => {
  if (!needNewDataSource.value && newValue) {
    updateDataSource();
  }
});

watch(needLoadDataSource, (newValue) => {
  if (!needLoadDataSource.value && newValue) {
    loadDataSource();
  }
});

watch(() => props.data, () => {
  loadDataSource();
});

watch(() => props.sourceUri, () => {
  loadDataSource();
});

watch(() => props.markerSize, () => {
  loadDataSource();
});

watch(() => props.markerSymbol, () => {
  loadDataSource();
});

watch(() => props.markerColor, () => {
  loadDataSource();
});

watch(() => props.stroke, () => {
  loadDataSource();
});

watch(() => props.strokeWidth, () => {
  loadDataSource();
});

watch(() => props.fill, () => {
  loadDataSource();
});

watch(() => props.clampToGround, () => {
  loadDataSource();
});

watch(() => props.credit, () => {
  loadDataSource();
});

// TODO this is not right.  Need to fix.
watch(() => props.index, () => {
  needNewDataSource.value = true;
});

watch(
  () => props.name,
  (newValue) => {
    if (newValue === undefined) {
      needNewDataSource.value = true;
    } else if (dataSource.value) {
      dataSource.value.name = newValue;
    }
  },
);

watch(
  () => props.clustering,
  (newValue) => {
    if (newValue === undefined) {
      needNewDataSource.value = true;
    } else if (dataSource.value) {
      dataSource.value.clustering = newValue;
    }
  },
);
watch(
  () => props.show,
  (newValue) => {
    if (newValue === undefined) {
      needNewDataSource.value = true;
    } else if (dataSource.value) {
      dataSource.value.show = newValue;
    }
  },
);

onMounted(() => {
  updateDataSource();
});

const render = () => {};
</script>
