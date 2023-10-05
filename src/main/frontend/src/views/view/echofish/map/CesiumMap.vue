<template>
  <div>
    <cs-viewer :flyTo="flyTo">
      <template #screenSpaceEventHandler="{ csEvents }">
        <cs-screen-space-positioned-event-action :cs-events="csEvents" :type="Cesium.ScreenSpaceEventType.LEFT_CLICK" @input="mapMouseHandler.handleLeftClick" />
        <cs-screen-space-positioned-event-action :cs-events="csEvents" :type="Cesium.ScreenSpaceEventType.MOUSE_MOVE" @input="mapMouseHandler.handleMouseMove" />
      </template>
      <template #dataSources="{ csEvents }">
        <cs-mvt-data-source :cs-events="csEvents" name="mvt" :index="0" :show="true" />
        <cs-custom-data-source :cs-events="csEvents" :entities="locationEntities" :index="1" name="location" :show="true" />
      </template>
      <template #globe="{ csEvents }">
        <cs-globe :cs-events="csEvents" :tile-cache-size="0" :preload-ancestors="false" :preload-siblings="false">
          <template #imageryLayers="{ globeEvents }">
            <cs-imagery-layer :globeEvents="globeEvents" :show="true" :index="0">
              <template #default="{ registerImageryProvider }">
                <cs-url-template-imagery-provider :registerImageryProvider="registerImageryProvider" :tilingScheme="tilingScheme" url="https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_basemap_NCEI_wgs84/MapServer/tile/{z}/{y}/{x}" :maximumLevel="9" />
              </template>
            </cs-imagery-layer>
            <cs-mvt-imagery-layer :globeEvents="globeEvents" :show="true" :index="1" :csEvents="csEvents" dataSourceName="mvt">
              <template #default="{ registerImageryProvider }">
                <cs-mvt-imagery-provider :csEvents="csEvents" dataSourceName="mvt" :entityFactory="entityFactory" :registerImageryProvider="registerImageryProvider" :tilingScheme="tilingScheme" :url="mvtUrl" :custom-tags="customTags" :maximumLevel="7" />
              </template>
            </cs-mvt-imagery-layer>
          </template>
        </cs-globe>
      </template>
    </cs-viewer>
    <feature-name-container
      v-if="fnc.fncEntities.length"
      :top="fnc.fncTop"
      :left="fnc.fncLeft"
      :entities="fnc.fncEntities"
      :selectable="fnc.fncSelectable"
      :latitude="fnc.fncLatitude"
      :longitude="fnc.fncLongitude"
      @select="mapMouseHandler.handleEntityClick" />
  </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import CsMvtDataSource from '@/lib/cesium-mvt/vue/CsMvtDataSource.vue';
import CsMvtImageryProvider from '@/lib/cesium-mvt/vue/CsMvtImageryProvider.vue';
import CsMvtImageryLayer from '@/lib/cesium-mvt/vue/CsMvtImageryLayer.vue';
import CsViewer from '@/lib/cesium-vue/vue/CsViewer.vue';
import CsGlobe from '@/lib/cesium-vue/vue/CsGlobe.vue';
import MvtEntityFactory from '@/views/view/echofish/map/MvtEntityFactory';
import CsImageryLayer from '@/lib/cesium-vue/vue/CsImageryLayer.vue';
import CsUrlTemplateImageryProvider from '@/lib/cesium-vue/vue/CsUrlTemplateImageryProvider.vue';
import CsScreenSpacePositionedEventAction from '@/lib/cesium-vue/vue/CsScreenSpacePositionedEventAction.vue';
import FeatureNameContainer from '@/views/view/echofish/map/FeatureNameContainer.vue';
import MapMouseHandler from '@/views/view/echofish/map/MapMouseHandler';
import FeatureNameContainerState from '@/views/view/echofish/map/FeatureNameContainerState';
import {
  computed, reactive,
} from 'vue';
import { ZARR_BASE_URL } from '@/basePath';
import { Router, useRouter } from 'vue-router';
import FlyToOptions from '@/lib/cesium-vue/api/FlyToOptions';
import CsCustomDataSource from '@/lib/cesium-vue/vue/CsCustomDataSource.vue';

const router: Router = useRouter();

const customTags = {
  t: () => `${Date.now()}`,
};
const mvtUrl = `${ZARR_BASE_URL}/spatial/mvt/global/{z}/{x}/{y}.pbf?t={t}`;
const entityFactory = new MvtEntityFactory();
const tilingScheme = new Cesium.GeographicTilingScheme();
const fnc = reactive(new FeatureNameContainerState());
const mapMouseHandler = new MapMouseHandler(fnc, router);

const props = withDefaults(defineProps<{
  flyTo?: Cesium.Cartesian3,
  locationEntities: Cesium.Entity[],
}>(), {
  flyTo: Cesium.Cartesian3.fromDegrees(0, 0, 15000000),
});

const flyToCoords = computed(() => props.flyTo);
const locationEntities = computed(() => props.locationEntities);
const flyTo = computed(() => ({ destination: flyToCoords.value } as FlyToOptions));

</script>
