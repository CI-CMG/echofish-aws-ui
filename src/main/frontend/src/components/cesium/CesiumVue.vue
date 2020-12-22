<template>
  <div class="map" ref="cs"/>
</template>

<script>
import * as Cesium from 'cesium/Cesium';
import { getColorForString } from './colorSelector';
import MapboxVectorTileImageryProvider from './imagery/MapboxVectorTileImageryProvider';
import { MVT_BASE_PATH } from '../../services/basePath';

const MAX_CLICKABLE_HEIGHT = 150000;

export default {
  props: {
    geoJson: Object,
    viewRect: Object,
    getGeoFeatures: Function,
    updateViewRect: Function,
    onPathClick: Function,
    maximumZoomDistance: Number,
    initialLongitude: Number,
    initialLatitude: Number,
    initialHeight: Number,
    cruiseName: String,
  },
  methods: {
    getViewer() {
      return this.viewer;
    },
    getGeoFeaturesForRect({ rect, oldRect, cruiseName }) {
      if (this.cruiseName) {
        this.getGeoFeatures({ type: 'echofish_cruise_path', cruiseName });
      } else {
        const {
          west, south, east, north,
        } = rect;
        if (west > -180.0 || south > -90.0 || east < 180.0 || north < 90.0) {
          this.getGeoFeatures({
            type: 'echofish_cruise_path',
            rect: {
              west, south, east, north,
            },
          });
        } else if (!oldRect || oldRect.west > -180.0 || oldRect.south > -90.0 || oldRect.east < 180.0 || oldRect.north < 90.0) {
          this.getGeoFeatures({ type: 'echofish_cruise_area' });
        }
      }
    },
    handleCameraMoved() {
      const { scene, camera } = this.viewer;
      const scratchRectangle = new Cesium.Rectangle();
      const rect = camera.computeViewRectangle(scene.globe.ellipsoid, scratchRectangle);
      const west = Cesium.Math.toDegrees(rect.west);
      const south = Cesium.Math.toDegrees(rect.south);
      const east = Cesium.Math.toDegrees(rect.east);
      const north = Cesium.Math.toDegrees(rect.north);
      const height = camera.positionCartographic.height;
      if (this.updateViewRect) {
        this.updateViewRect({
          west, south, east, north, height,
        });
      }
    },
    handleMouseClicked({ position }) {
      // const { camera, scene } = this.viewer;
      // const pickedObject = scene.pick(position);
      const { camera, scene, imageryLayers } = this.viewer;
      const cartesian = camera.pickEllipsoid(position, scene.globe.ellipsoid);
      const pickRay = camera.getPickRay(position);
      if (cartesian && pickRay) {
        const featuresPromise = imageryLayers.pickImageryLayerFeatures(pickRay, scene);
        if (featuresPromise) {
          Cesium.when(featuresPromise, (features) => {
            if (features && features.length) {
              // const info = features[0];
              // const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              // const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
              // const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
              // const cruiseName = info.properties.cruise_name;

              this.onPathClick();
            }
          });
        }
      }
    },
    handleMouseMoved(movement) {
      const { camera, scene, imageryLayers } = this.viewer;
      const cartesian = camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
      const pickRay = camera.getPickRay(movement.endPosition);
      if (cartesian && pickRay) {
        const featuresPromise = imageryLayers.pickImageryLayerFeatures(pickRay, scene);
        if (featuresPromise) {
          Cesium.when(featuresPromise, (features) => {
            if (features && features.length) {
              const info = features[0];
              if (camera.positionCartographic.height <= MAX_CLICKABLE_HEIGHT) {
                this.$refs.cs.style.cursor = 'pointer';
              }
              const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
              const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);

              const cruiseName = info.properties.cruise_name;

              this.box.position = cartesian;
              this.box.label.show = true;
              this.box.label.text = `Cruise: ${cruiseName}\nLon: ${(`${longitudeString}`)}\u00B0`
                + `\nLat: ${(`${latitudeString}`)}\u00B0`;
            } else {
              this.$refs.cs.style.cursor = 'default';
              this.box.label.show = false;
            }

            // features.forEach((info) => {
            //   console.log(info.properties.cruise_name);
            // });
          });
        } else {
          this.$refs.cs.style.cursor = 'default';
          this.box.label.show = false;
        }
      } else {
        this.$refs.cs.style.cursor = 'default';
        this.box.label.show = false;
      }

      const pickedObject = scene.pick(movement.endPosition);
      if (Cesium.defined(pickedObject)) {
        // const cartesian = camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
        const entity = pickedObject.id;
        if (cartesian && entity) {
          if (entity.polyline && camera.positionCartographic.height <= MAX_CLICKABLE_HEIGHT) {
            this.$refs.cs.style.cursor = 'pointer';
          }

          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
          const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);

          this.box.position = cartesian;
          this.box.label.show = true;
          this.box.label.text = `Cruise: ${pickedObject.id.name}\nLon: ${(`${longitudeString}`)}\u00B0`
              + `\nLat: ${(`${latitudeString}`)}\u00B0`;
        } else {
          this.box.label.show = false;
        }
      } else {
        this.$refs.cs.style.cursor = 'default';
        this.box.label.show = false;
      }
    },
  },
  watch: {
    cruiseName(cn) {
      this.getGeoFeaturesForRect({ cruiseName: cn });
    },
    viewRect(rect, oldRect) {
      this.getGeoFeaturesForRect({ rect, oldRect });
    },
    geoJson(newGeoJson) {
      this.geoJsonDataSource.load(newGeoJson, { clampToGround: true })
        .then((dataSource) => {
          const entities = dataSource.entities.values;
          entities.forEach((entity) => {
            const cruiseName = entity.properties.cruise_name.valueOf();
            entity.name = cruiseName;
            const color = Cesium.Color.fromCssColorString(getColorForString(cruiseName));
            if (entity.polygon) {
              entity.polygon.material = color;
              entity.polygon.outline = true;
              entity.polygon.outlineColor = color;
              entity.polygon.outlineWidth = 3.0;
            } else if (entity.polyline) {
              entity.polyline.material = color;
              entity.polyline.width = 3.0;
            }
          });
        });
    },
  },
  mounted() {
    // Tile Service Working For Gazetteer
    // var GEBCO_2019_BASEMAP = new Cesium.WebMapTileServiceImageryProvider({
    // url : 'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_2019_basemap_ncei/MapServer/tile/{TileMatrix}/{TileRow}/{TileCol}?cacheKey=897cd2aef5b49055',
    //    layer : 'GEBCO_2019_BASEMAP',
    //    format : 'image/jpeg',
    //    maximumLevel: 10
    // });
    // viewer.imageryLayers.addImageryProvider(GEBCO_2019_BASEMAP);

    const baseLayer = new Cesium.ArcGisMapServerImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer',
      // url: 'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/web_mercator_gebco_2019_contours/MapServer',
      // url: 'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_2019_basemap_ncei/MapServer',
      enablePickFeatures: false,
    });

    const refLayer = new Cesium.ArcGisMapServerImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer',
      // url: 'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/web_mercator_gebco_2019_contours/MapServer',
      enablePickFeatures: false,
    });

    this.viewer = new Cesium.Viewer(this.$refs.cs,
      {
        shadows: false,
        geocoder: false,
        baseLayerPicker: false,
        imageryProvider: baseLayer,
        selectionIndicator: false,
        infoBox: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        fullscreenButton: false,
        homeButton: false,
        projectionPicker: false,
        sceneModePicker: false,
        // scene3DOnly: true,
      });

    const { scene, camera } = this.viewer;
    scene.screenSpaceCameraController.enableLook = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.maximumZoomDistance = this.maximumZoomDistance;
    this.geoJsonDataSource = new Cesium.GeoJsonDataSource();
    this.viewer.dataSources.add(this.geoJsonDataSource);

    const layers = scene.imageryLayers;
    layers.addImageryProvider(
      new MapboxVectorTileImageryProvider({
        url: `${MVT_BASE_PATH}/{z}/{x}/{y}.pbf`,
        // layerName: 'SH1305',
        styleFunc: () => ({
          fillStyle: 'yellow',
          strokeStyle: 'yellow',
          lineWidth: 5,
        }),
        // rectangle: this.rectangle,
        minimumZoom: 0,
        maximumNativeZoom: 14,
        maximumZoom: 28,
        uniqueIdProp: 'FID',
        featureInfoFunc: (feature) => {
          const featureInfo = new Cesium.ImageryLayerFeatureInfo();
          // if (Cesium.defined(mapboxVectorTileCatalogItem.nameProperty)) {
          //   featureInfo.name =
          //     feature.properties[mapboxVectorTileCatalogItem.nameProperty];
          // }
          featureInfo.properties = { ...feature.properties };
          featureInfo.data = {
            id: feature.properties.FID,
          }; // For highlight
          return featureInfo;
        },
      }),
    );

    this.box = this.viewer.entities.add({
      label: {
        show: false,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0),
      },
    });

    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(this.handleMouseMoved, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(this.handleMouseClicked, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.viewer.imageryLayers.addImageryProvider(refLayer);

    camera.moveEnd.addEventListener(this.handleCameraMoved);
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(this.initialLongitude, this.initialLatitude, this.initialHeight),
    });
    this.getGeoFeaturesForRect({ cruiseName: this.cruiseName, rect: this.viewRect });
  },
};
</script>
