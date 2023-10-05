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

let layer: MapboxVectorTileImageryLayer | undefined;
let viewer: CustomViewer | undefined;
let dataSource: Cesium.DataSource | undefined;
const needNewLayer = ref(false);
let imageryProvider: MapboxVectorTileImageryProvider | undefined;
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
  if (viewer && dataSource) {
    imageryProvider = newValue;
    const newLayer = new MapboxVectorTileImageryLayer(
      imageryProvider,
      dataSource,
      viewer.scene.globe,
      props,
    );
    props.globeEvents.registerImageryLayer(newLayer, props.index);
    layer = newLayer;
  }
  needNewLayer.value = false;
};

const registerImageryProvider: ImageryProviderRegistration = (ip: Cesium.ImageryProvider) => {
  imageryProvider = ip as MapboxVectorTileImageryProvider;
  needNewLayer.value = true;
};

watch(show, (newValue) => {
  if (layer) {
    layer.show = newValue;
  }
});

watch(alpha, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.alpha = newValue;
  }
});

watch(brightness, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.brightness = newValue;
  }
});

watch(colorToAlpha, (newValue) => {
  if (!newValue) {
    needNewLayer.value = true;
  } else if (layer) {
    layer.colorToAlpha = newValue;
  }
});

watch(colorToAlphaThreshold, (newValue) => {
  if (layer) {
    layer.colorToAlphaThreshold = newValue;
  }
});

watch(contrast, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.contrast = newValue;
  }
});

watch(cutoutRectangle, (newValue) => {
  if (!newValue) {
    needNewLayer.value = true;
  } else if (layer) {
    layer.cutoutRectangle = newValue;
  }
});

watch(dayAlpha, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.dayAlpha = newValue;
  }
});

watch(gamma, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.gamma = newValue;
  }
});

watch(hue, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.hue = newValue;
  }
});

watch(magnificationFilter, (newValue) => {
  if (layer) {
    layer.magnificationFilter = newValue;
  }
});

watch(minificationFilter, (newValue) => {
  if (layer) {
    layer.minificationFilter = newValue;
  }
});

watch(nightAlpha, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.nightAlpha = newValue;
  }
});

watch(saturation, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.saturation = newValue;
  }
});

watch(splitDirection, (newValue) => {
  if (typeof newValue === 'function') {
    needNewLayer.value = true;
  } else if (layer) {
    layer.splitDirection = newValue;
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

watch(needNewLayer, (newValue, oldValue) => {
  if (imageryProvider && !oldValue && newValue) {
    updateImageryProvider(imageryProvider);
  }
});

// watch(imageryProvider, (newValue) => {
//   if (newValue) {
//     updateImageryProvider(newValue);
//   }
// });

// watch(viewer, (newValue) => {
//   if (newValue) {
//     needNewLayer.value = true;
//   }
// });

// watch(dataSource, () => {
//   needNewLayer.value = true;
// });

onMounted(() => {
  props.csEvents.onNewViewer((nextViewer) => {
    viewer = nextViewer;
    needNewLayer.value = true;
  });
  props.csEvents.onUpdateDatasource((nextDataSource) => {
    if (nextDataSource.name === dataSourceName.value) {
      dataSource = nextDataSource;
      needNewLayer.value = true;
    }
  });
});

</script>
