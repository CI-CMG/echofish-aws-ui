<template>
  <slot :registerImageryProvider="registerImageryProvider" />
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import ImageryProviderRegistration from '@/lib/cesium-vue/api/ImageryProviderRegistration';
import FrameStateFunction from '@/lib/cesium-vue/api/FrameStateFunction';
import GlobeEventContext from '@/lib/cesium-vue/api/GlobeEventContext';
import { MapboxVectorTileImageryLayer } from '@/lib/cesium-mvt/MapboxVectorTileImageryLayer';
import { MapboxVectorTileImageryProvider } from '@/lib/cesium-mvt/MapboxVectorTileImageryProvider';
import WidgetEventContext from '@/lib/cesium-vue/api/WidgetEventContext';
import { CustomViewer } from '@/lib/cesium-vue/internal/Custom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<{
  index: number,
  csEvents: WidgetEventContext,
  dataSourceName: string,
  globeEvents: GlobeEventContext
  rectangle?: Cesium.Rectangle,
  alpha?: number | FrameStateFunction,
  nightAlpha?: number | FrameStateFunction,
  dayAlpha?: number | FrameStateFunction,
  brightness?: number | FrameStateFunction,
  contrast?: number | FrameStateFunction,
  hue?: number | FrameStateFunction,
  saturation?: number | FrameStateFunction,
  gamma?: number | FrameStateFunction,
  splitDirection?: Cesium.SplitDirection | FrameStateFunction,
  minificationFilter?: Cesium.TextureMinificationFilter,
  magnificationFilter?: Cesium.TextureMagnificationFilter,
  show?: boolean,
  maximumAnisotropy?: number,
  minimumTerrainLevel?: number,
  maximumTerrainLevel?: number,
  cutoutRectangle?: Cesium.Rectangle,
  colorToAlpha?: Cesium.Color,
  colorToAlphaThreshold?: number
}>(), {
  rectangle: undefined,
  alpha: 1.0,
  nightAlpha: 1.0,
  dayAlpha: 1.0,
  brightness: 1.0,
  contrast: 1.0,
  hue: 0.0,
  saturation: 1.0,
  gamma: 1.0,
  splitDirection: Cesium.SplitDirection.NONE,
  minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
  magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
  show: true,
  maximumAnisotropy: undefined,
  minimumTerrainLevel: undefined,
  maximumTerrainLevel: undefined,
  cutoutRectangle: undefined,
  colorToAlpha: undefined,
  colorToAlphaThreshold: 0.004,
});

const layer = ref<MapboxVectorTileImageryLayer | undefined>();
const viewer = ref<CustomViewer | undefined>();
const dataSource = ref<Cesium.DataSource | undefined>();
const needNewLayer = ref(false);
const imageryProvider = ref<MapboxVectorTileImageryProvider | undefined>();
const dataSourceName = computed(() => props.dataSourceName);
const show = computed(() => props.show);
const alpha = computed(() => props.alpha);
const rectangle = computed(() => props.rectangle);
const nightAlpha = computed(() => props.nightAlpha);
const dayAlpha = computed(() => props.dayAlpha);
const brightness = computed(() => props.brightness);
const contrast = computed(() => props.contrast);
const hue = computed(() => props.hue);
const saturation = computed(() => props.saturation);
const gamma = computed(() => props.gamma);
const splitDirection = computed(() => props.splitDirection);
const minificationFilter = computed(() => props.minificationFilter);
const magnificationFilter = computed(() => props.magnificationFilter);
const maximumAnisotropy = computed(() => props.maximumAnisotropy);
const minimumTerrainLevel = computed(() => props.minimumTerrainLevel);
const maximumTerrainLevel = computed(() => props.maximumTerrainLevel);
const cutoutRectangle = computed(() => props.cutoutRectangle);
const colorToAlpha = computed(() => props.colorToAlpha);
const colorToAlphaThreshold = computed(() => props.colorToAlphaThreshold);

const updateImageryProvider = (newValue: MapboxVectorTileImageryProvider) => {
  if (viewer.value && dataSource.value) {
    imageryProvider.value = newValue;
    const newLayer = new MapboxVectorTileImageryLayer(
      imageryProvider.value,
      dataSource.value,
      viewer.value.scene.globe,
      props,
    );
    props.globeEvents.registerImageryLayer(newLayer, props.index);
    layer.value = newLayer;
  }
  needNewLayer.value = false;
};

const registerImageryProvider: ImageryProviderRegistration = (ip: Cesium.ImageryProvider) => {
  imageryProvider.value = ip as MapboxVectorTileImageryProvider;
};

watch(show, (newValue) => {
  if (layer.value) {
    layer.value.show = newValue;
  }
});

watch(alpha, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.alpha = newValue;
  }
});

watch(brightness, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.brightness = newValue;
  }
});

watch(colorToAlpha, (newValue) => {
  if (!newValue) {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.colorToAlpha = newValue;
  }
});

watch(colorToAlphaThreshold, (newValue) => {
  if (layer.value) {
    layer.value.colorToAlphaThreshold = newValue;
  }
});

watch(contrast, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.contrast = newValue;
  }
});

watch(cutoutRectangle, (newValue) => {
  if (!newValue) {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.cutoutRectangle = newValue;
  }
});

watch(dayAlpha, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.dayAlpha = newValue;
  }
});

watch(gamma, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.gamma = newValue;
  }
});

watch(hue, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.hue = newValue;
  }
});

watch(magnificationFilter, (newValue) => {
  if (layer.value) {
    layer.value.magnificationFilter = newValue;
  }
});

watch(minificationFilter, (newValue) => {
  if (layer.value) {
    layer.value.minificationFilter = newValue;
  }
});

watch(nightAlpha, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.nightAlpha = newValue;
  }
});

watch(saturation, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.saturation = newValue;
  }
});

watch(splitDirection, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer.value) {
    layer.value.splitDirection = newValue;
  }
});

watch(rectangle, () => {
  needNewLayer.value = true;
});

watch(maximumAnisotropy, () => {
  needNewLayer.value = true;
});

watch(minimumTerrainLevel, () => {
  needNewLayer.value = true;
});

watch(maximumTerrainLevel, () => {
  needNewLayer.value = true;
});

watch(needNewLayer, (newValue) => {
  if (imageryProvider.value && !needNewLayer.value && newValue) {
    updateImageryProvider(imageryProvider.value);
  }
});

watch(imageryProvider, (newValue) => {
  if (newValue) {
    updateImageryProvider(newValue);
  }
});

watch(viewer, (newValue) => {
  if (newValue) {
    needNewLayer.value = true;
  }
});

watch(dataSource, () => {
  needNewLayer.value = true;
});

onMounted(() => {
  props.csEvents.onNewViewer((nextViewer) => {
    viewer.value = nextViewer;
  });
  props.csEvents.onUpdateDatasource((nextDataSource) => {
    if (nextDataSource.name === dataSourceName.value) {
      dataSource.value = nextDataSource;
    }
  });
});

</script>
