<template>
  <slot name="imageryLayers" :globeEvents="globeEvents" />
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import {
  watch, ref, onMounted,
} from 'vue';
import IndexedImageryLayer from '../api/IndexedImageryLayer';
import WidgetEventContext from '../api/WidgetEventContext';
import GlobeEventContext from '../api/GlobeEventContext';

const props = withDefaults(defineProps<{
  csEvents: WidgetEventContext;
  ellipsoid?: Cesium.Ellipsoid;

  // properties
  atmosphereBrightnessShift?: number; // 0.0
  atmosphereHueShift?: number; // 0.0
  atmosphereLightIntensity?: number; // 10.0
  atmosphereMieAnisotropy?: number; // 0.9
  atmosphereMieCoefficient?: Cesium.Cartesian3;
  atmosphereMieScaleHeight?: number; // 3200.0
  atmosphereRayleighCoefficient?: Cesium.Cartesian3;
  atmosphereRayleighScaleHeight?: number; // 10000.0
  atmosphereSaturationShift?: number; // 0.0
  backFaceCulling?: boolean; // true
  baseColor?: Cesium.Color;
  cartographicLimitRectangle?: Cesium.Rectangle; // Rectangle.MAX_VALUE
  clippingPlanes?: Cesium.ClippingPlaneCollection;
  depthTestAgainstTerrain?: boolean; // false
  dynamicAtmosphereLighting?: boolean; // true
  dynamicAtmosphereLightingFromSun?: boolean; // false;
  enableLighting?: boolean; // false;
  fillHighlightColor?: Cesium.Color;
  lambertDiffuseMultiplier?: number; // 0.9
  lightingFadeInDistance?: number; // 20000000.0
  lightingFadeOutDistance?: number; // 10000000.0
  loadingDescendantLimit?: number; // 20
  material?: Cesium.Material;
  maximumScreenSpaceError?: number; // 2
  nightFadeInDistance?: number; // 50000000.0
  nightFadeOutDistance?: number; // 10000000.0
  oceanNormalMapUrl?: string;
  preloadAncestors?: boolean; // true
  preloadSiblings?: boolean; // false
  shadows?: Cesium.ShadowMode; // ShadowMode.RECEIVE_ONLY
  show?: boolean; // true
  showGroundAtmosphere?: boolean; // true
  showSkirts?: boolean; // true
  showWaterEffect?: boolean; // true
  terrainExaggeration?: number; // 1.0
  terrainExaggerationRelativeHeight?: number; // 0.0
  terrainProvider?: Cesium.TerrainProvider;
  tileCacheSize?: number; // 100
  translucency?: Cesium.GlobeTranslucency;
  undergroundColor?: Cesium.Color; // Color.BLACK
  undergroundColorAlphaByDistance?: Cesium.NearFarScalar;
  vertexShadowDarkness?: number; // 0.3
}>(), {
  ellipsoid: undefined,
  atmosphereBrightnessShift: undefined,
  atmosphereHueShift: undefined,
  atmosphereLightIntensity: undefined,
  atmosphereMieAnisotropy: undefined,
  atmosphereMieCoefficient: undefined,
  atmosphereMieScaleHeight: undefined,
  atmosphereRayleighCoefficient: undefined,
  atmosphereRayleighScaleHeight: undefined,
  atmosphereSaturationShift: undefined,
  backFaceCulling: undefined,
  baseColor: undefined,
  cartographicLimitRectangle: undefined,
  clippingPlanes: undefined,
  depthTestAgainstTerrain: undefined,
  dynamicAtmosphereLighting: undefined,
  dynamicAtmosphereLightingFromSun: undefined,
  enableLighting: undefined,
  fillHighlightColor: undefined,
  lambertDiffuseMultiplier: undefined,
  lightingFadeInDistance: undefined,
  lightingFadeOutDistance: undefined,
  loadingDescendantLimit: undefined,
  material: undefined,
  maximumScreenSpaceError: undefined,
  nightFadeInDistance: undefined,
  nightFadeOutDistance: undefined,
  oceanNormalMapUrl: undefined,
  preloadAncestors: undefined,
  preloadSiblings: undefined,
  shadows: undefined,
  show: undefined,
  showGroundAtmosphere: undefined,
  showSkirts: undefined,
  showWaterEffect: undefined,
  terrainExaggeration: undefined,
  terrainExaggerationRelativeHeight: undefined,
  terrainProvider: undefined,
  tileCacheSize: undefined,
  translucency: undefined,
  undergroundColor: undefined,
  undergroundColorAlphaByDistance: undefined,
  vertexShadowDarkness: undefined,
});

const globe = ref<Cesium.Globe | undefined>();
const layers = ref<IndexedImageryLayer[]>([]);
const needNewGlobe = ref(false);

const initializeLayers = () => {
  if (globe.value) {
    globe.value.imageryLayers.removeAll(false);
    layers.value.forEach((layer) => {
      globe.value?.imageryLayers.add(layer.imageryLayer);
    });
  }
};

const initializeGlobe = () => {
  needNewGlobe.value = false;
  globe.value = new Cesium.Globe(props.ellipsoid || Cesium.Ellipsoid.WGS84);
  if (props.atmosphereBrightnessShift !== undefined) globe.value.atmosphereBrightnessShift = props.atmosphereBrightnessShift;
  if (props.atmosphereHueShift !== undefined) globe.value.atmosphereHueShift = props.atmosphereHueShift;
  if (props.atmosphereLightIntensity !== undefined) globe.value.atmosphereLightIntensity = props.atmosphereLightIntensity;
  if (props.atmosphereMieAnisotropy !== undefined) globe.value.atmosphereMieAnisotropy = props.atmosphereMieAnisotropy;
  if (props.atmosphereMieCoefficient !== undefined) globe.value.atmosphereMieCoefficient = props.atmosphereMieCoefficient;
  if (props.atmosphereMieScaleHeight !== undefined) globe.value.atmosphereMieScaleHeight = props.atmosphereMieScaleHeight;
  if (props.atmosphereRayleighCoefficient !== undefined) globe.value.atmosphereRayleighCoefficient = props.atmosphereRayleighCoefficient;
  if (props.atmosphereRayleighScaleHeight !== undefined) globe.value.atmosphereRayleighScaleHeight = props.atmosphereRayleighScaleHeight;
  if (props.atmosphereSaturationShift !== undefined) globe.value.atmosphereSaturationShift = props.atmosphereSaturationShift;
  if (props.backFaceCulling !== undefined) globe.value.backFaceCulling = props.backFaceCulling;
  if (props.baseColor !== undefined) globe.value.baseColor = props.baseColor;
  if (props.cartographicLimitRectangle !== undefined) globe.value.cartographicLimitRectangle = props.cartographicLimitRectangle;
  if (props.clippingPlanes !== undefined) globe.value.clippingPlanes = props.clippingPlanes;
  if (props.depthTestAgainstTerrain !== undefined) globe.value.depthTestAgainstTerrain = props.depthTestAgainstTerrain;
  if (props.dynamicAtmosphereLighting !== undefined) globe.value.dynamicAtmosphereLighting = props.dynamicAtmosphereLighting;
  if (props.dynamicAtmosphereLightingFromSun !== undefined) globe.value.dynamicAtmosphereLightingFromSun = props.dynamicAtmosphereLightingFromSun;
  if (props.enableLighting !== undefined) globe.value.enableLighting = props.enableLighting;
  if (props.fillHighlightColor !== undefined) globe.value.fillHighlightColor = props.fillHighlightColor;
  if (props.lambertDiffuseMultiplier !== undefined) globe.value.lambertDiffuseMultiplier = props.lambertDiffuseMultiplier;
  if (props.lightingFadeInDistance !== undefined) globe.value.lightingFadeInDistance = props.lightingFadeInDistance;
  if (props.lightingFadeOutDistance !== undefined) globe.value.lightingFadeOutDistance = props.lightingFadeOutDistance;
  if (props.loadingDescendantLimit !== undefined) globe.value.loadingDescendantLimit = props.loadingDescendantLimit;
  if (props.material !== undefined) globe.value.material = props.material;
  if (props.maximumScreenSpaceError !== undefined) globe.value.maximumScreenSpaceError = props.maximumScreenSpaceError;
  if (props.nightFadeInDistance !== undefined) globe.value.nightFadeInDistance = props.nightFadeInDistance;
  if (props.nightFadeOutDistance !== undefined) globe.value.nightFadeOutDistance = props.nightFadeOutDistance;
  if (props.oceanNormalMapUrl !== undefined) globe.value.oceanNormalMapUrl = props.oceanNormalMapUrl;
  if (props.preloadAncestors !== undefined) globe.value.preloadAncestors = props.preloadAncestors;
  if (props.preloadSiblings !== undefined) globe.value.preloadSiblings = props.preloadSiblings;
  if (props.shadows !== undefined) globe.value.shadows = props.shadows;
  if (props.show !== undefined) globe.value.show = props.show;
  if (props.showGroundAtmosphere !== undefined) globe.value.showGroundAtmosphere = props.showGroundAtmosphere;
  if (props.showSkirts !== undefined) globe.value.showSkirts = props.showSkirts;
  if (props.showWaterEffect !== undefined) globe.value.showWaterEffect = props.showWaterEffect;
  if (props.terrainExaggeration !== undefined) globe.value.terrainExaggeration = props.terrainExaggeration;
  if (props.terrainExaggerationRelativeHeight !== undefined) globe.value.terrainExaggerationRelativeHeight = props.terrainExaggerationRelativeHeight;
  if (props.terrainProvider !== undefined) globe.value.terrainProvider = props.terrainProvider;
  if (props.tileCacheSize !== undefined) globe.value.tileCacheSize = props.tileCacheSize;
  if (props.translucency !== undefined) globe.value.translucency = props.translucency;
  if (props.undergroundColor !== undefined) globe.value.undergroundColor = props.undergroundColor;
  if (props.undergroundColorAlphaByDistance !== undefined) globe.value.undergroundColorAlphaByDistance = props.undergroundColorAlphaByDistance;
  if (props.vertexShadowDarkness !== undefined) globe.value.vertexShadowDarkness = props.vertexShadowDarkness;

  initializeLayers();
  props.csEvents.updateGlobe(globe.value);
};

const globeEvents: GlobeEventContext = {
  registerImageryLayer(imageryLayer, index) {
    const tempLayers: IndexedImageryLayer[] = [];
    let added = false;
    layers.value.forEach((layer) => {
      if (layer.index < index) {
        tempLayers.push(layer);
      } else if (layer.index === index) {
        tempLayers.push(new IndexedImageryLayer(index, imageryLayer));
        added = true;
      } else if (layer.index > index) {
        if (added) {
          tempLayers.push(layer);
        } else {
          tempLayers.push(new IndexedImageryLayer(index, imageryLayer));
          added = true;
        }
      }
    });
    if (!added) {
      tempLayers.push(new IndexedImageryLayer(index, imageryLayer));
    }
    layers.value = tempLayers;
  },
};

onMounted(() => {
  initializeGlobe();
});

watch(layers, () => {
  initializeLayers();
});

watch(needNewGlobe, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    initializeGlobe();
  }
});

watch(() => props.ellipsoid, () => { needNewGlobe.value = true; });

watch(
  () => props.atmosphereBrightnessShift,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereBrightnessShift = newValue;
    }
  },
);

watch(
  () => props.atmosphereHueShift,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereHueShift = newValue;
    }
  },
);
watch(
  () => props.atmosphereLightIntensity,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereLightIntensity = newValue;
    }
  },
);
watch(
  () => props.atmosphereMieAnisotropy,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereMieAnisotropy = newValue;
    }
  },
);
watch(
  () => props.atmosphereMieCoefficient,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereMieCoefficient = newValue;
    }
  },
);
watch(
  () => props.atmosphereMieScaleHeight,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereMieScaleHeight = newValue;
    }
  },
);
watch(
  () => props.atmosphereRayleighCoefficient,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereRayleighCoefficient = newValue;
    }
  },
);
watch(
  () => props.atmosphereRayleighScaleHeight,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereRayleighScaleHeight = newValue;
    }
  },
);
watch(
  () => props.atmosphereSaturationShift,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.atmosphereSaturationShift = newValue;
    }
  },
);
watch(
  () => props.backFaceCulling,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.backFaceCulling = newValue;
    }
  },
);
watch(
  () => props.baseColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.baseColor = newValue;
    }
  },
);
watch(
  () => props.cartographicLimitRectangle,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.cartographicLimitRectangle = newValue;
    }
  },
);
watch(
  () => props.clippingPlanes,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.clippingPlanes = newValue;
    }
  },
);
watch(
  () => props.depthTestAgainstTerrain,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.depthTestAgainstTerrain = newValue;
    }
  },
);
watch(
  () => props.dynamicAtmosphereLighting,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.dynamicAtmosphereLighting = newValue;
    }
  },
);
watch(
  () => props.dynamicAtmosphereLightingFromSun,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.dynamicAtmosphereLightingFromSun = newValue;
    }
  },
);
watch(
  () => props.enableLighting,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.enableLighting = newValue;
    }
  },
);
watch(
  () => props.fillHighlightColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.fillHighlightColor = newValue;
    }
  },
);
watch(
  () => props.lambertDiffuseMultiplier,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.lambertDiffuseMultiplier = newValue;
    }
  },
);
watch(
  () => props.lightingFadeInDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.lightingFadeInDistance = newValue;
    }
  },
);
watch(
  () => props.lightingFadeOutDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.lightingFadeOutDistance = newValue;
    }
  },
);
watch(
  () => props.loadingDescendantLimit,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.loadingDescendantLimit = newValue;
    }
  },
);
watch(
  () => props.material,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.material = newValue;
    }
  },
);
watch(
  () => props.maximumScreenSpaceError,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.maximumScreenSpaceError = newValue;
    }
  },
);
watch(
  () => props.nightFadeInDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.nightFadeInDistance = newValue;
    }
  },
);
watch(
  () => props.nightFadeOutDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.nightFadeOutDistance = newValue;
    }
  },
);
watch(
  () => props.oceanNormalMapUrl,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.oceanNormalMapUrl = newValue;
    }
  },
);
watch(
  () => props.preloadAncestors,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.preloadAncestors = newValue;
    }
  },
);
watch(
  () => props.preloadSiblings,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.preloadSiblings = newValue;
    }
  },
);
watch(
  () => props.shadows,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.shadows = newValue;
    }
  },
);
watch(
  () => props.show,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.show = newValue;
    }
  },
);
watch(
  () => props.showGroundAtmosphere,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.showGroundAtmosphere = newValue;
    }
  },
);
watch(
  () => props.showSkirts,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.showSkirts = newValue;
    }
  },
);
watch(
  () => props.showWaterEffect,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.showWaterEffect = newValue;
    }
  },
);
watch(
  () => props.terrainExaggeration,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.terrainExaggeration = newValue;
    }
  },
);
watch(
  () => props.terrainExaggerationRelativeHeight,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.terrainExaggerationRelativeHeight = newValue;
    }
  },
);
watch(
  () => props.terrainProvider,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.terrainProvider = newValue;
    }
  },
);
watch(
  () => props.tileCacheSize,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.tileCacheSize = newValue;
    }
  },
);
watch(
  () => props.translucency,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.translucency = newValue;
    }
  },
);
watch(
  () => props.undergroundColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.undergroundColor = newValue;
    }
  },
);
watch(
  () => props.undergroundColorAlphaByDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.undergroundColorAlphaByDistance = newValue;
    }
  },
);
watch(
  () => props.vertexShadowDarkness,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe.value) {
      globe.value.vertexShadowDarkness = newValue;
    }
  },
);

</script>
