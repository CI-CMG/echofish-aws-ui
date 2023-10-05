<template>
  <render />
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import ImageryProviderRegistration from '../api/ImageryProviderRegistration';

const props = withDefaults(defineProps< {
  registerImageryProvider: ImageryProviderRegistration;
  options?: Promise<object> | any;
  url: Cesium.Resource | string;
  pickFeaturesUrl?: Cesium.Resource | string;
  urlSchemeZeroPadding?: any;
  subdomains?: string | string[];
  credit?: Cesium.Credit | string;
  minimumLevel?: number;
  maximumLevel?: number;
  rectangle?: Cesium.Rectangle;
  tilingScheme?: Cesium.TilingScheme;
  ellipsoid?: Cesium.Ellipsoid;
  tileWidth?: number;
  tileHeight?: number;
  hasAlphaChannel?: boolean;
  getFeatureInfoFormats?: Cesium.GetFeatureInfoFormat[];
  enablePickFeatures?: boolean;
  customTags?: any;
}>(), {
  options: undefined,
  pickFeaturesUrl: undefined,
  urlSchemeZeroPadding: undefined,
  subdomains: 'abc',
  credit: '',
  minimumLevel: 0,
  maximumLevel: undefined,
  rectangle: Cesium.Rectangle.MAX_VALUE,
  // differs from Cesium defaults
  tilingScheme: undefined,
  ellipsoid: undefined,
  tileWidth: 256,
  tileHeight: 256,
  hasAlphaChannel: true,
  getFeatureInfoFormats: undefined,
  // This differs from the Cesium default.  Turning off by default.
  enablePickFeatures: false,
  customTags: undefined,
});

let imageryProvider: Cesium.ImageryProvider | undefined;
const needNewProvider = ref(false);
const url = computed(() => props.url);
const options = computed(() => props.options);
const pickFeaturesUrl = computed(() => props.pickFeaturesUrl);
const urlSchemeZeroPadding = computed(() => props.urlSchemeZeroPadding);
const subdomains = computed(() => props.subdomains);
const credit = computed(() => props.credit);
const minimumLevel = computed(() => props.minimumLevel);
const maximumLevel = computed(() => props.maximumLevel);
const rectangle = computed(() => props.rectangle);
const tilingScheme = computed(() => props.tilingScheme);
const ellipsoid = computed(() => props.ellipsoid);
const tileWidth = computed(() => props.tileWidth);
const tileHeight = computed(() => props.tileHeight);
const hasAlphaChannel = computed(() => props.hasAlphaChannel);
const getFeatureInfoFormats = computed(() => props.getFeatureInfoFormats);
const enablePickFeatures = computed(() => props.enablePickFeatures);
const customTags = computed(() => props.customTags);

const updateImageryProvider = () => {
  imageryProvider = new Cesium.UrlTemplateImageryProvider(props);
  props.registerImageryProvider(imageryProvider);
  needNewProvider.value = false;
};

watch(needNewProvider, (newValue) => {
  if (!needNewProvider.value && newValue) {
    updateImageryProvider();
  }
});

watch(options, () => {
  needNewProvider.value = true;
});

watch(url, () => {
  needNewProvider.value = true;
});

watch(pickFeaturesUrl, () => {
  needNewProvider.value = true;
});

watch(urlSchemeZeroPadding, () => {
  needNewProvider.value = true;
});

watch(subdomains, () => {
  needNewProvider.value = true;
});

watch(credit, () => {
  needNewProvider.value = true;
});

watch(minimumLevel, () => {
  needNewProvider.value = true;
});

watch(maximumLevel, () => {
  needNewProvider.value = true;
});

watch(rectangle, () => {
  needNewProvider.value = true;
});

watch(tilingScheme, () => {
  needNewProvider.value = true;
});

watch(ellipsoid, () => {
  needNewProvider.value = true;
});

watch(tileWidth, () => {
  needNewProvider.value = true;
});

watch(tileHeight, () => {
  needNewProvider.value = true;
});

watch(hasAlphaChannel, () => {
  needNewProvider.value = true;
});

watch(getFeatureInfoFormats, () => {
  needNewProvider.value = true;
});

watch(enablePickFeatures, () => {
  needNewProvider.value = true;
});

watch(customTags, () => {
  needNewProvider.value = true;
});

onMounted(() => {
  updateImageryProvider();
});

const render = () => {};
</script>
