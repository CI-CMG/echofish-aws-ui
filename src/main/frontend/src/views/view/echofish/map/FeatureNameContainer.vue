<template>
  <div class="feature-name-container" :style="style">
    <table>
      <tbody>
        <tr v-for="entity in entities" :key="entity.id">
          <td>{{entity.id}}</td>
          <!--          <td>{{entity.properties.getValue(Cesium.JulianDate.now()).shipName}}</td>-->
          <!--          <td>{{entity.properties.getValue(Cesium.JulianDate.now()).cruiseName}}</td>-->
          <!--          <td>{{entity.properties.getValue(Cesium.JulianDate.now()).sensorName}}</td>-->
          <td v-if="selectable"><v-btn color="secondary" icon="mdi-information-outline" :size="30" :min-height="0" :min-width="0" @click="emit('select', entity)" /></td>
        </tr>
        <tr>
          <td colspan="3">{{`${longitude}° E/W, ${latitude}° N/S`}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  top: number,
  left: number,
  entities: Cesium.Entity[],
  latitude: number,
  longitude: number,
  selectable?: boolean
}>(), {
  selectable: false,
});

const emit = defineEmits(['select']);

const style = computed(() => `top: ${props.top}px; left: ${props.left}px;`);

</script>
