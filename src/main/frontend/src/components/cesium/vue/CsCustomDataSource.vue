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
  entities: Cesium.Entity[]
}>(), {
  clustering: undefined,
  show: undefined,
});

const dataSource = ref<Cesium.CustomDataSource | undefined>();
const needNewDataSource = ref(false);

const updateDataSource = () => {
  dataSource.value = new Cesium.GeoJsonDataSource(props.name);
  props.csEvents.updateDataSource(dataSource.value, props.index);
  needNewDataSource.value = false;
};

watch(needNewDataSource, (newValue) => {
  if (!needNewDataSource.value && newValue) {
    updateDataSource();
  }
});

watch(() => props.entities, () => {
  dataSource.value?.entities.removeAll();
  props.entities.forEach((entity) => dataSource.value?.entities.add(entity));
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
