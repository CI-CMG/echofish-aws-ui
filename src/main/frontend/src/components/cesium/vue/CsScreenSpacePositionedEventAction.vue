<template>
  <render />
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted } from 'vue';
import WidgetEventContext from '../api/WidgetEventContext';

const props = withDefaults(defineProps<{
  csEvents: WidgetEventContext;
  type: Cesium.ScreenSpaceEventType;
  modifier?: Cesium.KeyboardEventModifier;
}>(), {
  modifier: undefined,
});

const emit = defineEmits(['input']);

// TODO handle prop updates

onMounted(() => {
  const callback: Cesium.ScreenSpaceEventHandler.PositionedEventCallback = (event) => { emit('input', event, props.csEvents.getViewer()); };
  props.csEvents.setInputAction(callback, props.type, props.modifier);
});

const render = () => {};
</script>
