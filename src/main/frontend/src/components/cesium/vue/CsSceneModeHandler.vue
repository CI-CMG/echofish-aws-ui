<template>
  <render />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { SceneMode } from 'cesium';
import WidgetEventContext from '../api/WidgetEventContext';

const props = defineProps<{
  twoDimensional: boolean;
  csEvents: WidgetEventContext;
}>();

watch(() => props.twoDimensional, (twoDimensional) => {
  props.csEvents.changeSceneMode(twoDimensional ? SceneMode.SCENE2D : SceneMode.SCENE3D);
});

const render = () => {};
</script>
