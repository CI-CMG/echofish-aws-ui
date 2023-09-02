<template>
  <render />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import ImageryProviderRegistration from '../api/ImageryProviderRegistration';
import WidgetEventContext from '../api/WidgetEventContext';
import { Graticule } from '../api/Graticule';
import { GraticuleConfig } from '../api/GraticuleConfig';

const props = defineProps<{
  registerImageryProvider: ImageryProviderRegistration;
  csEvents: WidgetEventContext;
  visible: boolean;
  graticuleConfig?: Partial<GraticuleConfig>;
}>();

const imageryProvider = ref<Graticule | undefined>();
const needNewProvider = ref(false);

const updateImageryProvider = () => {
  if (props.visible) {
    imageryProvider.value = new Graticule(props.csEvents.getViewer().scene, props.graticuleConfig as GraticuleConfig);
    props.registerImageryProvider(imageryProvider.value);
    needNewProvider.value = false;
  } else {
    imageryProvider.value?.setVisible(props.visible);
  }
};

watch(() => props.visible, () => {
  updateImageryProvider();
});

watch(needNewProvider, (newValue) => {
  if (!needNewProvider.value && newValue) {
    updateImageryProvider();
  }
});

onMounted(() => {
  updateImageryProvider();
});

const render = () => {};
</script>
