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

let globe : Cesium.Globe | undefined;
let layers: IndexedImageryLayer[] = [];
const needNewGlobe = ref(false);

const initializeLayers = () => {
  if (globe) {
    globe.imageryLayers.removeAll(false);
    layers.forEach((layer) => {
      globe.imageryLayers.add(layer.imageryLayer);
    });
  }
};

const initializeGlobe = () => {
  needNewGlobe.value = false;
  globe = new Cesium.Globe(props.ellipsoid || Cesium.Ellipsoid.WGS84);
  if (props.atmosphereBrightnessShift !== undefined) globe.atmosphereBrightnessShift = props.atmosphereBrightnessShift;
  if (props.atmosphereHueShift !== undefined) globe.atmosphereHueShift = props.atmosphereHueShift;
  if (props.atmosphereLightIntensity !== undefined) globe.atmosphereLightIntensity = props.atmosphereLightIntensity;
  if (props.atmosphereMieAnisotropy !== undefined) globe.atmosphereMieAnisotropy = props.atmosphereMieAnisotropy;
  if (props.atmosphereMieCoefficient !== undefined) globe.atmosphereMieCoefficient = props.atmosphereMieCoefficient;
  if (props.atmosphereMieScaleHeight !== undefined) globe.atmosphereMieScaleHeight = props.atmosphereMieScaleHeight;
  if (props.atmosphereRayleighCoefficient !== undefined) globe.atmosphereRayleighCoefficient = props.atmosphereRayleighCoefficient;
  if (props.atmosphereRayleighScaleHeight !== undefined) globe.atmosphereRayleighScaleHeight = props.atmosphereRayleighScaleHeight;
  if (props.atmosphereSaturationShift !== undefined) globe.atmosphereSaturationShift = props.atmosphereSaturationShift;
  if (props.backFaceCulling !== undefined) globe.backFaceCulling = props.backFaceCulling;
  if (props.baseColor !== undefined) globe.baseColor = props.baseColor;
  if (props.cartographicLimitRectangle !== undefined) globe.cartographicLimitRectangle = props.cartographicLimitRectangle;
  if (props.clippingPlanes !== undefined) globe.clippingPlanes = props.clippingPlanes;
  if (props.depthTestAgainstTerrain !== undefined) globe.depthTestAgainstTerrain = props.depthTestAgainstTerrain;
  if (props.dynamicAtmosphereLighting !== undefined) globe.dynamicAtmosphereLighting = props.dynamicAtmosphereLighting;
  if (props.dynamicAtmosphereLightingFromSun !== undefined) globe.dynamicAtmosphereLightingFromSun = props.dynamicAtmosphereLightingFromSun;
  if (props.enableLighting !== undefined) globe.enableLighting = props.enableLighting;
  if (props.fillHighlightColor !== undefined) globe.fillHighlightColor = props.fillHighlightColor;
  if (props.lambertDiffuseMultiplier !== undefined) globe.lambertDiffuseMultiplier = props.lambertDiffuseMultiplier;
  if (props.lightingFadeInDistance !== undefined) globe.lightingFadeInDistance = props.lightingFadeInDistance;
  if (props.lightingFadeOutDistance !== undefined) globe.lightingFadeOutDistance = props.lightingFadeOutDistance;
  if (props.loadingDescendantLimit !== undefined) globe.loadingDescendantLimit = props.loadingDescendantLimit;
  if (props.material !== undefined) globe.material = props.material;
  if (props.maximumScreenSpaceError !== undefined) globe.maximumScreenSpaceError = props.maximumScreenSpaceError;
  if (props.nightFadeInDistance !== undefined) globe.nightFadeInDistance = props.nightFadeInDistance;
  if (props.nightFadeOutDistance !== undefined) globe.nightFadeOutDistance = props.nightFadeOutDistance;
  if (props.oceanNormalMapUrl !== undefined) globe.oceanNormalMapUrl = props.oceanNormalMapUrl;
  if (props.preloadAncestors !== undefined) globe.preloadAncestors = props.preloadAncestors;
  if (props.preloadSiblings !== undefined) globe.preloadSiblings = props.preloadSiblings;
  if (props.shadows !== undefined) globe.shadows = props.shadows;
  if (props.show !== undefined) globe.show = props.show;
  if (props.showGroundAtmosphere !== undefined) globe.showGroundAtmosphere = props.showGroundAtmosphere;
  if (props.showSkirts !== undefined) globe.showSkirts = props.showSkirts;
  if (props.showWaterEffect !== undefined) globe.showWaterEffect = props.showWaterEffect;
  if (props.terrainExaggeration !== undefined) globe.terrainExaggeration = props.terrainExaggeration;
  if (props.terrainExaggerationRelativeHeight !== undefined) globe.terrainExaggerationRelativeHeight = props.terrainExaggerationRelativeHeight;
  if (props.terrainProvider !== undefined) globe.terrainProvider = props.terrainProvider;
  if (props.tileCacheSize !== undefined) globe.tileCacheSize = props.tileCacheSize;
  if (props.translucency !== undefined) globe.translucency = props.translucency;
  if (props.undergroundColor !== undefined) globe.undergroundColor = props.undergroundColor;
  if (props.undergroundColorAlphaByDistance !== undefined) globe.undergroundColorAlphaByDistance = props.undergroundColorAlphaByDistance;
  if (props.vertexShadowDarkness !== undefined) globe.vertexShadowDarkness = props.vertexShadowDarkness;

  initializeLayers();
  props.csEvents.updateGlobe(globe);
};

const globeEvents: GlobeEventContext = {
  registerImageryLayer(imageryLayer, index) {
    const tempLayers: IndexedImageryLayer[] = [];
    let added = false;
    layers.forEach((layer) => {
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
    layers = tempLayers;
    initializeLayers();
  },
};

onMounted(() => {
  initializeGlobe();
});

// watch(layers, () => {
//   initializeLayers();
// });

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
    } else if (globe) {
      globe.atmosphereBrightnessShift = newValue;
    }
  },
);

watch(
  () => props.atmosphereHueShift,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereHueShift = newValue;
    }
  },
);
watch(
  () => props.atmosphereLightIntensity,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereLightIntensity = newValue;
    }
  },
);
watch(
  () => props.atmosphereMieAnisotropy,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereMieAnisotropy = newValue;
    }
  },
);
watch(
  () => props.atmosphereMieCoefficient,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereMieCoefficient = newValue;
    }
  },
);
watch(
  () => props.atmosphereMieScaleHeight,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereMieScaleHeight = newValue;
    }
  },
);
watch(
  () => props.atmosphereRayleighCoefficient,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereRayleighCoefficient = newValue;
    }
  },
);
watch(
  () => props.atmosphereRayleighScaleHeight,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereRayleighScaleHeight = newValue;
    }
  },
);
watch(
  () => props.atmosphereSaturationShift,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.atmosphereSaturationShift = newValue;
    }
  },
);
watch(
  () => props.backFaceCulling,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.backFaceCulling = newValue;
    }
  },
);
watch(
  () => props.baseColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.baseColor = newValue;
    }
  },
);
watch(
  () => props.cartographicLimitRectangle,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.cartographicLimitRectangle = newValue;
    }
  },
);
watch(
  () => props.clippingPlanes,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.clippingPlanes = newValue;
    }
  },
);
watch(
  () => props.depthTestAgainstTerrain,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.depthTestAgainstTerrain = newValue;
    }
  },
);
watch(
  () => props.dynamicAtmosphereLighting,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.dynamicAtmosphereLighting = newValue;
    }
  },
);
watch(
  () => props.dynamicAtmosphereLightingFromSun,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.dynamicAtmosphereLightingFromSun = newValue;
    }
  },
);
watch(
  () => props.enableLighting,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.enableLighting = newValue;
    }
  },
);
watch(
  () => props.fillHighlightColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.fillHighlightColor = newValue;
    }
  },
);
watch(
  () => props.lambertDiffuseMultiplier,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.lambertDiffuseMultiplier = newValue;
    }
  },
);
watch(
  () => props.lightingFadeInDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.lightingFadeInDistance = newValue;
    }
  },
);
watch(
  () => props.lightingFadeOutDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.lightingFadeOutDistance = newValue;
    }
  },
);
watch(
  () => props.loadingDescendantLimit,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.loadingDescendantLimit = newValue;
    }
  },
);
watch(
  () => props.material,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.material = newValue;
    }
  },
);
watch(
  () => props.maximumScreenSpaceError,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.maximumScreenSpaceError = newValue;
    }
  },
);
watch(
  () => props.nightFadeInDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.nightFadeInDistance = newValue;
    }
  },
);
watch(
  () => props.nightFadeOutDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.nightFadeOutDistance = newValue;
    }
  },
);
watch(
  () => props.oceanNormalMapUrl,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.oceanNormalMapUrl = newValue;
    }
  },
);
watch(
  () => props.preloadAncestors,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.preloadAncestors = newValue;
    }
  },
);
watch(
  () => props.preloadSiblings,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.preloadSiblings = newValue;
    }
  },
);
watch(
  () => props.shadows,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.shadows = newValue;
    }
  },
);
watch(
  () => props.show,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.show = newValue;
    }
  },
);
watch(
  () => props.showGroundAtmosphere,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.showGroundAtmosphere = newValue;
    }
  },
);
watch(
  () => props.showSkirts,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.showSkirts = newValue;
    }
  },
);
watch(
  () => props.showWaterEffect,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.showWaterEffect = newValue;
    }
  },
);
watch(
  () => props.terrainExaggeration,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.terrainExaggeration = newValue;
    }
  },
);
watch(
  () => props.terrainExaggerationRelativeHeight,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.terrainExaggerationRelativeHeight = newValue;
    }
  },
);
watch(
  () => props.terrainProvider,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.terrainProvider = newValue;
    }
  },
);
watch(
  () => props.tileCacheSize,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.tileCacheSize = newValue;
    }
  },
);
watch(
  () => props.translucency,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.translucency = newValue;
    }
  },
);
watch(
  () => props.undergroundColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.undergroundColor = newValue;
    }
  },
);
watch(
  () => props.undergroundColorAlphaByDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.undergroundColorAlphaByDistance = newValue;
    }
  },
);
watch(
  () => props.vertexShadowDarkness,
  (newValue) => {
    if (newValue === undefined) {
      needNewGlobe.value = true;
    } else if (globe) {
      globe.vertexShadowDarkness = newValue;
    }
  },
);

</script>
