<template>
  <div class="HomeView">
    <h1>echofish</h1>

    <Renderer resize="window" orbit-ctrl ref="renderer">
      <Camera :position="{ z: 10 }" />
      <Scene background="#4DBA87">
        <PointLight :position="{ y: 50, z: 50 }" />
        <Box ref="box">
          <LambertMaterial />
        </Box>
      </Scene>
    </Renderer>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Intro from '@/components/Intro.vue';
// import { renderer, camera, scene, box } from 'troisjs';
import {
  Box, Camera, LambertMaterial,
  PointLight, Renderer, Scene,
} from 'troisjs';

@Options({
  components: {
    Intro, Box, Camera, Renderer, Scene, PointLight, LambertMaterial,
  },
})
export default class HomeView extends Vue {}
</script>

<style lang="scss">
</style>
