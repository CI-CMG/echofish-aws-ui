<template>
  <render />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WidgetEventContext from '../api/WidgetEventContext';

const props = defineProps<{
  csEvents: WidgetEventContext
}>();

const emit = defineEmits(['input']);

onMounted(() => {
  const callback = () => { emit('input', props.csEvents.getViewer()); };
  props.csEvents.setInputCameraAction(callback);
});

const render = () => {};
</script>
