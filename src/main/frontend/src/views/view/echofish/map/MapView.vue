<template>
  <div class="main-cesium-container">
    <cs-viewer>
      <template #globe="{ csEvents }">
        <cs-globe :cs-events="csEvents">
          <template #imageryLayers="{ globeEvents }">
            <cs-imagery-layer :globeEvents="globeEvents" :show="true" :index="0">
              <template #default="{ registerImageryProvider }">
                <cs-url-template-imagery-provider
                  :registerImageryProvider="registerImageryProvider"
                  :tilingScheme="tilingScheme"
                  url="https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_basemap_NCEI_wgs84/MapServer/tile/{z}/{y}/{x}"
                  :maximumLevel="9"
                />
              </template>
            </cs-imagery-layer>
          </template>
        </cs-globe>
      </template>
    </cs-viewer>
  </div>
</template>

<script setup lang="ts">
import CsViewer from '@/components/cesium/vue/CsViewer.vue';
import CsGlobe from '@/components/cesium/vue/CsGlobe.vue';
import CsImageryLayer from '@/components/cesium/vue/CsImageryLayer.vue';
import CsUrlTemplateImageryProvider from '@/components/cesium/vue/CsUrlTemplateImageryProvider.vue';
import * as Cesium from 'cesium';

const tilingScheme = new Cesium.GeographicTilingScheme();
</script>
