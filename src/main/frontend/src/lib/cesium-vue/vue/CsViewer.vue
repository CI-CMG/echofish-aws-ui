<template>
  <slot name="screenSpaceEventHandler" :csEvents="csEvents" />
  <slot name="cameraEventHandler" :csEvents="csEvents" />
  <slot name="globe" :csEvents="csEvents" />
  <slot name="dataSources" :csEvents="csEvents" />
  <div class="cesium-globe" ref="cs" />
</template>

<script setup lang="ts">
/* eslint-disable no-underscore-dangle */
import {
  onMounted, ref, watch,
} from 'vue';
import * as Cesium from 'cesium';
import { SceneMode } from 'cesium';
import WidgetEventContext from '../api/WidgetEventContext';
import IndexedDataSource from '../api/IndexedDataSource';
import FlyToOptions from '../api/FlyToOptions';
import { CustomViewer } from '../internal/Custom';

class ScreenInput {
  event: Cesium.ScreenSpaceEventHandler.PositionedEventCallback | Cesium.ScreenSpaceEventHandler.MotionEventCallback | Cesium.ScreenSpaceEventHandler.WheelEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointMotionEventCallback;
  type: Cesium.ScreenSpaceEventType;
  modifier?: Cesium.KeyboardEventModifier;
  constructor(
    event: Cesium.ScreenSpaceEventHandler.PositionedEventCallback | Cesium.ScreenSpaceEventHandler.MotionEventCallback | Cesium.ScreenSpaceEventHandler.WheelEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointMotionEventCallback,
    type: Cesium.ScreenSpaceEventType,
    modifier?: Cesium.KeyboardEventModifier,
  ) {
    this.event = event;
    this.type = type;
    this.modifier = modifier;
  }
}

const props = withDefaults(defineProps<{
  // scene constructor
  contextOptions?: Cesium.ContextOptions;
  creditContainer?: Element | string;
  creditViewport?: Element | string;
  mapProjection?: Cesium.MapProjection;
  orderIndependentTranslucency?: boolean;
  scene3DOnly?: boolean;
  shadows?: boolean;
  mapMode2D?: Cesium.MapMode2D;
  depthPlaneEllipsoidOffset?: number;

  // scene constructor and properties
  requestRenderMode?: boolean;
  maximumRenderTimeChange?: number;
  msaaSamples?: number;

  // scene properties
  backgroundColor?: Cesium.Color;
  completeMorphOnUserInput?: boolean;
  eyeSeparation?: number;
  farToNearRatio?: number;
  focalLength?: number;
  fog?: Cesium.Fog;
  gamma?: number;
  highDynamicRange?: boolean;
  invertClassification?: boolean;
  invertClassificationColor?: Cesium.Color;
  light?: Cesium.Light;
  logarithmicDepthBuffer?: boolean;
  logarithmicDepthFarToNearRatio?: number;
  minimumDisableDepthTestDistance?: number;
  sceneMode?: Cesium.SceneMode;
  moon?: Cesium.Moon;
  morphTime?: number;
  nearToFarDistance2D?: number;
  pickTranslucentDepth?: boolean;
  postProcessStages?: Cesium.PostProcessStageCollection;
  rethrowRenderErrors?: boolean;
  shadowMap?: Cesium.ShadowMap;
  skyAtmosphere?: Cesium.SkyAtmosphere;
  skyBox?: Cesium.SkyBox;
  specularEnvironmentMaps?: string;
  sun?: Cesium.Sun;
  sunBloom?: boolean;
  useDepthPicking?: boolean;
  useWebVR?: boolean;

  animation?: boolean;
  fullscreenButton?: boolean;
  vrButton?: boolean;
  geocoder?: boolean | Cesium.GeocoderService[];
  homeButton?: boolean;
  infoBox?: boolean;
  sceneModePicker?: boolean;
  selectionIndicator?: boolean;
  timeline?: boolean;
  navigationHelpButton?: boolean;
  navigationInstructionsInitiallyVisible?: boolean;
  shouldAnimate?: boolean;
  clockViewModel?: Cesium.ClockViewModel;
  fullscreenElement?: Element | string;
  automaticallyTrackDataSourceClocks?: boolean;
  projectionPicker?: boolean;

  clockTrackedDataSource?: Cesium.DataSource;
  selectedEntity?: Cesium.Entity;
  trackedEntity?: Cesium.Entity;

  // widget constructor
  showRenderLoopErrors?: boolean;
  blurActiveElementOnCanvasFocus?: boolean;

  // widget constructor and properties
  targetFrameRate?: number;
  useBrowserRecommendedResolution?: boolean;
  useDefaultRenderLoop?: boolean;

  // widget properties
  resolutionScale?: number;

  flyTo?: FlyToOptions;
}>(), {

  // scene constructor
  contextOptions: undefined,
  creditContainer: undefined,
  creditViewport: undefined,
  mapProjection: undefined,
  orderIndependentTranslucency: undefined,
  scene3DOnly: undefined,
  shadows: undefined,
  mapMode2D: undefined,
  depthPlaneEllipsoidOffset: undefined,

  // scene constructor and properties
  requestRenderMode: undefined,
  maximumRenderTimeChange: undefined,
  msaaSamples: undefined,

  // scene properties
  backgroundColor: undefined,
  completeMorphOnUserInput: undefined,
  eyeSeparation: undefined,
  farToNearRatio: undefined,
  focalLength: undefined,
  fog: undefined,
  gamma: undefined,
  highDynamicRange: undefined,
  invertClassification: false,
  invertClassificationColor: undefined,
  light: undefined,
  logarithmicDepthBuffer: undefined,
  logarithmicDepthFarToNearRatio: undefined,
  minimumDisableDepthTestDistance: undefined,
  sceneMode: undefined,
  moon: undefined,
  morphTime: undefined,
  nearToFarDistance2D: undefined,
  pickTranslucentDepth: undefined,
  postProcessStages: undefined,
  rethrowRenderErrors: undefined,
  shadowMap: undefined,
  skyAtmosphere: undefined,
  skyBox: undefined,
  specularEnvironmentMaps: undefined,
  sun: undefined,
  sunBloom: undefined,
  useDepthPicking: undefined,
  useWebVR: undefined,

  // CesiumWidget props
  useDefaultRenderLoop: undefined,
  useBrowserRecommendedResolution: undefined,
  targetFrameRate: undefined,
  showRenderLoopErrors: undefined,
  blurActiveElementOnCanvasFocus: undefined,

  resolutionScale: undefined,

  animation: false,
  fullscreenButton: false,
  vrButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  navigationInstructionsInitiallyVisible: false,
  shouldAnimate: false,
  clockViewModel: undefined,
  fullscreenElement: undefined,
  automaticallyTrackDataSourceClocks: undefined,
  projectionPicker: false,

  clockTrackedDataSource: undefined,
  selectedEntity: undefined,
  trackedEntity: undefined,

  flyTo: undefined,
});

const emit = defineEmits(['moveend']);

const cs = ref<HTMLElement | undefined>();
const viewer = ref<CustomViewer | undefined>();
const globe = ref<Cesium.Globe | undefined>();
const needNewViewer = ref(false);
const dataSources = ref<IndexedDataSource[]>([]);
const position = ref<Cesium.Cartesian3 | undefined>();
const screenInputs = ref<ScreenInput[]>([]);
const cameraInputs = ref<(() => void)[]>([]);

const flyTo = () => {
  if (props.flyTo && viewer.value) {
    if (props.flyTo.target) {
      viewer.value.flyTo(props.flyTo.target, props.flyTo);
    } else if (props.flyTo.destination) {
      viewer.value.camera.flyTo({ ...props.flyTo, destination: props.flyTo.destination });
    } else if (props.flyTo.boundingSphere) {
      viewer.value.camera.flyToBoundingSphere(props.flyTo.boundingSphere, props.flyTo);
    }
  }
};

class WidgetEventContextImpl implements WidgetEventContext {
  public onNewViewerCallbacks: Array<(viewer: CustomViewer) => void> = [];
  public onUpdateDatasourceCallbacks: Array<(datasources: Cesium.DataSource) => void> = [];

  onUpdateDatasource(callback: (datasource: Cesium.DataSource) => void) {
    // if (viewer.value) {
    //   callback(viewer.value);
    // }
    this.onUpdateDatasourceCallbacks.push(callback);
  }

  onNewViewer(callback: (viewer: CustomViewer) => void) {
    if (viewer.value) {
      callback(viewer.value);
    }
    this.onNewViewerCallbacks.push(callback);
  }

  // eslint-disable-next-line class-methods-use-this
  getViewer() {
    if (viewer.value) {
      return viewer.value;
    }
    throw new Cesium.RuntimeError('Viewer not initialized');
  }

  // eslint-disable-next-line class-methods-use-this
  updateGlobe(newGlobe?: Cesium.Globe) {
    globe.value = newGlobe;
  }

  // eslint-disable-next-line class-methods-use-this
  setInputAction(event: Cesium.ScreenSpaceEventHandler.PositionedEventCallback | Cesium.ScreenSpaceEventHandler.MotionEventCallback | Cesium.ScreenSpaceEventHandler.WheelEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointMotionEventCallback, type: Cesium.ScreenSpaceEventType, modifier?: Cesium.KeyboardEventModifier) {
    screenInputs.value = [...screenInputs.value, new ScreenInput(event, type, modifier)];
  }

  // eslint-disable-next-line class-methods-use-this
  setInputCameraAction(callback: () => void) {
    cameraInputs.value = [...cameraInputs.value, callback];
  }

  // eslint-disable-next-line class-methods-use-this
  updateDataSource(updateDataSource: Cesium.DataSource, index: number) {
    const tempDataSources: IndexedDataSource[] = [];
    let added = false;
    dataSources.value.forEach((dataSource) => {
      if (dataSource.index < index) {
        tempDataSources.push(dataSource);
      } else if (dataSource.index === index) {
        tempDataSources.push(new IndexedDataSource(index, updateDataSource));
        added = true;
      } else if (dataSource.index > index) {
        if (added) {
          tempDataSources.push(dataSource);
        } else {
          tempDataSources.push(new IndexedDataSource(index, updateDataSource));
          added = true;
        }
      }
    });
    if (!added) {
      tempDataSources.push(new IndexedDataSource(index, updateDataSource));
    }
    dataSources.value = tempDataSources;
  }

  // eslint-disable-next-line class-methods-use-this
  changeSceneMode(sceneMode: Cesium.SceneMode) {
    if (viewer.value) {
      if (sceneMode === SceneMode.SCENE2D) {
        viewer.value?.sceneModePicker.viewModel.morphTo2D();
      } else {
        viewer.value?.sceneModePicker.viewModel.morphTo3D();
      }
    }
  }
}

const csEvents = new WidgetEventContextImpl();

const initializeDataSources = () => {
  if (viewer.value) {
    viewer.value.dataSources.removeAll(false);
    dataSources.value.forEach((dataSource) => {
      viewer.value?.dataSources.add(dataSource.dataSource);
      csEvents.onUpdateDatasourceCallbacks.forEach((callback) => {
        callback(dataSource.dataSource);
      });
    });
  }
};

const initializeViewer = () => {
  needNewViewer.value = false;
  if (cs.value) {
    const options = {
      imageryProvider: false,
      terrainProvider: undefined,
      skyBox: props.skyBox,
      skyAtmosphere: props.skyAtmosphere,
      sceneMode: props.sceneMode,
      scene3DOnly: props.scene3DOnly,
      orderIndependentTranslucency: props.orderIndependentTranslucency,
      mapProjection: props.mapProjection,
      globe: false,
      useDefaultRenderLoop: props.useDefaultRenderLoop,
      useBrowserRecommendedResolution: props.useBrowserRecommendedResolution,
      targetFrameRate: props.targetFrameRate,
      showRenderLoopErrors: props.showRenderLoopErrors,
      contextOptions: props.contextOptions,
      creditContainer: props.creditContainer,
      creditViewport: props.creditViewport,
      shadows: props.shadows,
      terrainShadows: undefined,
      mapMode2D: props.mapMode2D,
      blurActiveElementOnCanvasFocus: props.blurActiveElementOnCanvasFocus,
      requestRenderMode: props.requestRenderMode,
      maximumRenderTimeChange: props.maximumRenderTimeChange,
      msaaSamples: props.msaaSamples,

      baseLayerPicker: false,
      selectedImageryProviderViewModel: undefined,
      imageryProviderViewModels: undefined,
      selectedTerrainProviderViewModel: undefined,
      terrainProviderViewModels: undefined,

      animation: props.animation,
      fullscreenButton: props.fullscreenButton,
      vrButton: props.vrButton,
      geocoder: props.geocoder,
      homeButton: props.homeButton,
      infoBox: props.infoBox,
      sceneModePicker: props.sceneModePicker,
      selectionIndicator: props.selectionIndicator,
      timeline: props.timeline,
      navigationHelpButton: props.navigationHelpButton,
      navigationInstructionsInitiallyVisible: props.navigationInstructionsInitiallyVisible,
      shouldAnimate: props.shouldAnimate,
      clockViewModel: props.clockViewModel,
      fullscreenElement: props.fullscreenButton,
      automaticallyTrackDataSourceClocks: props.automaticallyTrackDataSourceClocks,
      dataSources: undefined,
      projectionPicker: props.projectionPicker,
    };

    options.sceneModePicker = true;

    viewer.value = new CustomViewer(cs.value, options);
    const scene = viewer.value?.scene;
    scene.screenSpaceCameraController.maximumZoomDistance = 30000000;
    const camera = viewer.value?.camera;
    camera.percentageChanged = 0.001;
    if (scene) {
      if (props.backgroundColor !== undefined) scene.backgroundColor = props.backgroundColor;
      if (props.completeMorphOnUserInput !== undefined) scene.completeMorphOnUserInput = props.completeMorphOnUserInput;
      if (props.eyeSeparation !== undefined) scene.eyeSeparation = props.eyeSeparation;
      if (props.farToNearRatio !== undefined) scene.farToNearRatio = props.farToNearRatio;
      if (props.focalLength !== undefined) scene.focalLength = props.focalLength;
      if (props.fog !== undefined) scene.fog = props.fog;
      if (props.gamma !== undefined) scene.gamma = props.gamma;
      if (props.highDynamicRange !== undefined) scene.highDynamicRange = props.highDynamicRange;
      if (props.invertClassification !== undefined) scene.invertClassification = props.invertClassification;
      if (props.invertClassificationColor !== undefined) scene.invertClassificationColor = props.invertClassificationColor;
      if (props.light !== undefined) scene.light = props.light;
      if (props.logarithmicDepthBuffer !== undefined) scene.logarithmicDepthBuffer = props.logarithmicDepthBuffer;
      if (props.logarithmicDepthFarToNearRatio !== undefined) scene.logarithmicDepthFarToNearRatio = props.logarithmicDepthFarToNearRatio;
      if (props.minimumDisableDepthTestDistance !== undefined) scene.minimumDisableDepthTestDistance = props.minimumDisableDepthTestDistance;
      if (props.sceneMode !== undefined) scene.mode = props.sceneMode;
      if (props.moon !== undefined) scene.moon = props.moon;
      if (props.morphTime !== undefined) scene.morphTime = props.morphTime;
      if (props.nearToFarDistance2D !== undefined) scene.nearToFarDistance2D = props.nearToFarDistance2D;
      if (props.pickTranslucentDepth !== undefined) scene.pickTranslucentDepth = props.pickTranslucentDepth;
      if (props.postProcessStages !== undefined) scene.postProcessStages = props.postProcessStages;
      if (props.rethrowRenderErrors !== undefined) scene.rethrowRenderErrors = props.rethrowRenderErrors;
      if (props.shadowMap !== undefined) scene.shadowMap = props.shadowMap;
      if (props.skyAtmosphere !== undefined) scene.skyAtmosphere = props.skyAtmosphere;
      if (props.skyBox !== undefined) scene.skyBox = props.skyBox;
      if (props.specularEnvironmentMaps !== undefined) scene.specularEnvironmentMaps = props.specularEnvironmentMaps;
      if (props.sun !== undefined) scene.sun = props.sun;
      if (props.sunBloom !== undefined) scene.sunBloom = props.sunBloom;
      if (props.useDepthPicking !== undefined) scene.useDepthPicking = props.useDepthPicking;
      if (props.useWebVR !== undefined) scene.useWebVR = props.useWebVR;
    }
    if (position.value) {
      viewer.value.camera.flyTo({ destination: position.value, duration: 0.0 });
    } else {
      flyTo();
    }
    viewer.value.camera.moveEnd.addEventListener(() => {
      position.value = viewer.value?.camera.position;
      emit('moveend', position.value);
    });

    initializeDataSources();
    csEvents.onNewViewerCallbacks.forEach((callback) => {
      if (viewer.value) {
        callback(viewer.value);
      }
    });
  }
};

onMounted(() => {
  initializeViewer();
});

watch(() => props.flyTo, () => {
  flyTo();
  if (viewer.value) {
    viewer.value.scene.screenSpaceCameraController.polar = !!(props.flyTo && props.flyTo.destinationIsPolar);
  }
});

watch(needNewViewer, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    initializeViewer();
  }
});

watch(() => props.contextOptions, () => { needNewViewer.value = true; });
watch(() => props.creditContainer, () => { needNewViewer.value = true; });
watch(() => props.creditViewport, () => { needNewViewer.value = true; });
watch(() => props.mapProjection, () => { needNewViewer.value = true; });
watch(() => props.orderIndependentTranslucency, () => { needNewViewer.value = true; });
watch(() => props.scene3DOnly, () => { needNewViewer.value = true; });
watch(() => props.shadows, () => { needNewViewer.value = true; });
watch(() => props.mapMode2D, () => { needNewViewer.value = true; });
watch(() => props.depthPlaneEllipsoidOffset, () => { needNewViewer.value = true; });

watch(
  () => props.requestRenderMode,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.requestRenderMode = newValue;
    }
  },
);

watch(
  () => props.maximumRenderTimeChange,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.maximumRenderTimeChange = newValue;
    }
  },
);

watch(
  () => props.msaaSamples,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.msaaSamples = newValue;
    }
  },
);

watch(
  () => props.backgroundColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.backgroundColor = newValue;
    }
  },
);

watch(
  () => props.completeMorphOnUserInput,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.completeMorphOnUserInput = newValue;
    }
  },
);

watch(
  () => props.eyeSeparation,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.eyeSeparation = newValue;
    }
  },
);

watch(
  () => props.farToNearRatio,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.farToNearRatio = newValue;
    }
  },
);

watch(
  () => props.focalLength,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.focalLength = newValue;
    }
  },
);

watch(
  () => props.fog,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.fog = newValue;
    }
  },
);

watch(
  () => props.gamma,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.gamma = newValue;
    }
  },
);

watch(
  () => props.highDynamicRange,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.highDynamicRange = newValue;
    }
  },
);

watch(
  () => props.invertClassification,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.invertClassification = newValue;
    }
  },
);

watch(
  () => props.invertClassificationColor,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.invertClassificationColor = newValue;
    }
  },
);

watch(
  () => props.light,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.light = newValue;
    }
  },
);

watch(
  () => props.logarithmicDepthBuffer,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.logarithmicDepthBuffer = newValue;
    }
  },
);

watch(
  () => props.logarithmicDepthFarToNearRatio,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.logarithmicDepthFarToNearRatio = newValue;
    }
  },
);

watch(
  () => props.minimumDisableDepthTestDistance,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.minimumDisableDepthTestDistance = newValue;
    }
  },
);

watch(
  () => props.sceneMode,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.mode = newValue;
    }
  },
);

watch(
  () => props.moon,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.moon = newValue;
    }
  },
);

watch(
  () => props.morphTime,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.morphTime = newValue;
    }
  },
);

watch(
  () => props.nearToFarDistance2D,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.nearToFarDistance2D = newValue;
    }
  },
);

watch(
  () => props.pickTranslucentDepth,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.pickTranslucentDepth = newValue;
    }
  },
);

watch(
  () => props.postProcessStages,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.postProcessStages = newValue;
    }
  },
);

watch(
  () => props.rethrowRenderErrors,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.rethrowRenderErrors = newValue;
    }
  },
);

watch(
  () => props.shadowMap,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.shadowMap = newValue;
    }
  },
);

watch(
  () => props.skyAtmosphere,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.skyAtmosphere = newValue;
    }
  },
);

watch(
  () => props.skyBox,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.skyBox = newValue;
    }
  },
);

watch(
  () => props.specularEnvironmentMaps,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.specularEnvironmentMaps = newValue;
    }
  },
);

watch(
  () => props.sun,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.sun = newValue;
    }
  },
);

watch(
  () => props.sunBloom,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.sunBloom = newValue;
    }
  },
);

watch(
  () => props.useDepthPicking,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.useDepthPicking = newValue;
    }
  },
);

watch(
  () => props.useWebVR,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.scene.useWebVR = newValue;
    }
  },
);

watch(() => props.showRenderLoopErrors, () => { needNewViewer.value = true; });
watch(() => props.blurActiveElementOnCanvasFocus, () => { needNewViewer.value = true; });

watch(
  () => props.targetFrameRate,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.targetFrameRate = newValue;
    }
  },
);

watch(
  () => props.useBrowserRecommendedResolution,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.useBrowserRecommendedResolution = newValue;
    }
  },
);

watch(
  () => props.useDefaultRenderLoop,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.useDefaultRenderLoop = newValue;
    }
  },
);

watch(
  () => props.resolutionScale,
  (newValue) => {
    if (newValue === undefined) {
      needNewViewer.value = true;
    } else if (viewer.value) {
      viewer.value.resolutionScale = newValue;
    }
  },
);

watch(screenInputs, (newValue, oldValue) => {
  if (viewer.value) {
    oldValue.forEach((input) => {
      viewer.value?.screenSpaceEventHandler.removeInputAction(input.type, input.modifier);
    });
    newValue.forEach((input) => {
      const callback = viewer.value?.screenSpaceEventHandler.getInputAction(input.type, input.modifier);
      if (callback) {
        const cb: Cesium.ScreenSpaceEventHandler.PositionedEventCallback = (event) => {
          callback(event as Cesium.ScreenSpaceEventHandler.PositionedEvent & Cesium.ScreenSpaceEventHandler.MotionEvent & number & Cesium.ScreenSpaceEventHandler.TwoPointEvent & Cesium.ScreenSpaceEventHandler.TwoPointMotionEvent);
          input.event(event as Cesium.ScreenSpaceEventHandler.PositionedEvent & Cesium.ScreenSpaceEventHandler.MotionEvent & number & Cesium.ScreenSpaceEventHandler.TwoPointEvent & Cesium.ScreenSpaceEventHandler.TwoPointMotionEvent);
        };
        viewer.value?.screenSpaceEventHandler.removeInputAction(input.type, input.modifier);
        viewer.value?.screenSpaceEventHandler.setInputAction(cb, input.type, input.modifier);
      } else {
        viewer.value?.screenSpaceEventHandler.setInputAction(input.event, input.type, input.modifier);
      }
    });
  }
});

watch(cameraInputs, (newValue, oldValue) => {
  if (viewer.value) {
    oldValue.forEach((input) => {
      viewer.value?.camera.changed.removeEventListener(input);
      viewer.value?.camera.moveEnd.removeEventListener(input);
    });
    newValue.forEach((input) => {
      viewer.value?.camera.changed.addEventListener(input);
      viewer.value?.camera.moveEnd.addEventListener(input);
    });
  }
});

watch(dataSources, () => {
  initializeDataSources();
});

watch(globe, (newValue) => {
  if (viewer.value && newValue) {
    viewer.value.scene.globe = newValue;
  }
});

defineExpose({ cs });
</script>
