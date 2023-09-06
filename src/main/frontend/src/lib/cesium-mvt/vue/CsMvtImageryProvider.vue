<template>
  <render />
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import ImageryProviderRegistration from '@/lib/cesium-vue/api/ImageryProviderRegistration';
import WidgetEventContext from '@/lib/cesium-vue/api/WidgetEventContext';
import { MapboxVectorTileImageryProvider } from '@/lib/cesium-mvt/MapboxVectorTileImageryProvider';
import EntityFactory from '@/lib/cesium-mvt/EntityFactory';
import { CustomViewer } from '@/lib/cesium-vue/internal/Custom';

const props = withDefaults(defineProps< {
  csEvents: WidgetEventContext;
  registerImageryProvider: ImageryProviderRegistration;
  dataSourceName: string;
  entityFactory: EntityFactory;
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

const imageryProvider = ref<MapboxVectorTileImageryProvider | undefined>();
const viewer = ref<CustomViewer | undefined>();
const dataSource = ref<Cesium.DataSource | undefined>();
const needNewProvider = ref(false);
const dataSourceName = computed(() => props.dataSourceName);
const entityFactory = computed(() => props.entityFactory);
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
  if (viewer.value && dataSource.value) {
    imageryProvider.value = new MapboxVectorTileImageryProvider(props, dataSource.value, entityFactory.value);
    props.registerImageryProvider(imageryProvider.value);
  }
  needNewProvider.value = false;
};

watch(needNewProvider, (newValue) => {
  if (!needNewProvider.value && newValue) {
    updateImageryProvider();
  }
});

watch(dataSourceName, () => {
  needNewProvider.value = true;
});

watch(entityFactory, () => {
  needNewProvider.value = true;
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

watch(viewer, () => {
  needNewProvider.value = true;
});

watch(dataSource, () => {
  needNewProvider.value = true;
});

onMounted(() => {
  props.csEvents.onNewViewer((nextViewer) => {
    viewer.value = nextViewer;
    updateImageryProvider();
  });
  props.csEvents.onUpdateDatasource((nextDataSource) => {
    if (nextDataSource.name === dataSourceName.value) {
      dataSource.value = nextDataSource;
      updateImageryProvider();
    }
  });
});

const render = () => {};
</script>
