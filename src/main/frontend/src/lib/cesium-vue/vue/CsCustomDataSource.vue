<template>
  <render />
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import { watch } from 'vue';
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
  show: true,
});

function createDataSource(name, show, entities, index) {
  const ds = new Cesium.CustomDataSource(name);
  ds.show = show;
  entities.forEach((entity) => {
    const copy = new Cesium.Entity();
    copy.merge(entity);
    ds.entities.add(entity);
  });
  props.csEvents.updateDataSource(ds, index);
  return ds;
}

const dataSource = createDataSource(props.name, props.show, props.entities, props.index);
// const needNewDataSource = ref(false);

// const updateDataSource = () => {
//   dataSource.name = props.name;
//   props.csEvents.updateDataSource(dataSource, props.index);
//   needNewDataSource.value = false;
// };

// watch(needNewDataSource, (newValue) => {
//   if (!needNewDataSource.value && newValue) {
//     updateDataSource();
//   }
// });

// TODO this is not right.  Need to fix.
// watch(() => props.index, () => {
//   needNewDataSource.value = true;
// });

watch(
  () => props.name,
  (newValue) => {
    dataSource.name = newValue;
  },
);

watch(
  () => props.clustering,
  (newValue) => {
    dataSource.clustering = newValue;
  },
);
watch(
  () => props.show,
  (newValue) => {
    dataSource.show = newValue;
  },
);

watch(
  () => props.entities,
  (nextEntities) => {
    dataSource.entities.removeAll();
    nextEntities.forEach((entity) => {
      const copy = new Cesium.Entity();
      copy.merge(entity);
      dataSource.entities.add(entity);
    });
  },
);
//
// onMounted(() => {
//   updateDataSource();
// });

const render = () => {};
</script>
