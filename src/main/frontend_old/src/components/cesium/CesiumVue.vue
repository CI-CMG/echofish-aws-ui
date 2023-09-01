<template>
  <div>
    <div class="map" ref="cs"/>
  </div>
</template>

<script>
import * as Cesium from 'cesium/Cesium';
import { MVT_BASE_PATH } from '@/basePath';
import { getColorForString } from './colorSelector';
import MapboxVectorTileImageryProvider from './imagery/MapboxVectorTileImageryProvider';

const MAX_CLICKABLE_HEIGHT = 150000;

export default {

  props: {
    geoJson: Object,
    viewRect: {
      type: Object,
      required: false,
    },
    getGeoFeatures: Function,
    updateViewRect: {
      type: Function,
      required: false,
    },
    onPathClick: Function,
    maximumZoomDistance: Number,
    cruiseName: String,
    longitude: Number,
    latitude: Number,
    height: Number,
    billboard: {
      type: Object,
      required: false,
    },
  },

  data() {
    return {
    };
  },

  methods: {
    getViewer() {
      return this.viewer;
    },
    getGeoFeaturesForRect({ rect, oldRect, cruiseName }) {
      if (this.cruiseName) {
        this.getGeoFeatures({ type: 'echofish_cruise_path', cruiseName });
      } else if (rect) {
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
      const picked = this.pickObject(position);
      if (picked) {
        this.onPathClick(picked);
      } else {
        this.pickImageryLayerFeature(position, (featureInfo) => {
          this.onPathClick(featureInfo);
        });
      }
      //
      //
      //
      // // const { camera, scene } = this.viewer;
      // // const pickedObject = scene.pick(position);
      // const { camera, scene, imageryLayers } = this.viewer;
      // const cartesian = camera.pickEllipsoid(position, scene.globe.ellipsoid);
      // const pickRay = camera.getPickRay(position);
      // if (cartesian && pickRay) {
      //   const featuresPromise = imageryLayers.pickImageryLayerFeatures(pickRay, scene);
      //   if (featuresPromise) {
      //     Cesium.when(featuresPromise, (features) => {
      //       if (features && features.length) {
      //         // const info = features[0];
      //         // const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      //         // const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
      //         // const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
      //         // const cruiseName = info.properties.cruise_name;
      //
      //         this.onPathClick();
      //       }
      //     });
      //   }
      // }
    },
    objectFromCartesian(cruiseName, cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const longitudeString = longitude.toFixed(4);
      const latitudeString = latitude.toFixed(4);

      return {
        cartesian,
        cruiseName,
        longitude,
        longitudeString,
        latitude,
        latitudeString,
      };
    },
    pickObject(endPosition) {
      const { camera, scene } = this.viewer;
      const cartesian = camera.pickEllipsoid(endPosition, scene.globe.ellipsoid);
      const pickedObject = scene.pick(endPosition);
      if (Cesium.defined(pickedObject)) {
        const entity = pickedObject.id;
        if (cartesian && entity) {
          if (entity.polyline && camera.positionCartographic.height <= MAX_CLICKABLE_HEIGHT) {
            this.$refs.cs.style.cursor = 'pointer';
          }

          return this.objectFromCartesian(pickedObject.id.name, cartesian);
        }
      }
      return null;
    },
    pickImageryLayerFeature(endPosition, callback) {
      const { camera, scene, imageryLayers } = this.viewer;
      const cartesian = camera.pickEllipsoid(endPosition, scene.globe.ellipsoid);
      const pickRay = camera.getPickRay(endPosition);
      if (cartesian && pickRay) {
        const featuresPromise = imageryLayers.pickImageryLayerFeatures(pickRay, scene);
        if (featuresPromise) {
          Cesium.when(featuresPromise, (features) => {
            if (features && features.length) {
              const info = features[0];
              if (camera.positionCartographic.height <= MAX_CLICKABLE_HEIGHT) {
                this.$refs.cs.style.cursor = 'pointer';
              }

              callback(this.objectFromCartesian(info.properties.cruise_name, cartesian));
            } else {
              callback(null);
            }
          });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    },
    selectPointer(featureInfo) {
      const { camera } = this.viewer;
      if (featureInfo) {
        if (camera.positionCartographic.height <= MAX_CLICKABLE_HEIGHT) {
          this.$refs.cs.style.cursor = 'pointer';
        }

        this.box.position = featureInfo.cartesian;
        this.box.label.show = true;
        this.box.label.text = `Cruise: ${featureInfo.cruiseName}\nLon: ${(`${featureInfo.longitudeString}`)}\u00B0`
          + `\nLat: ${(`${featureInfo.latitudeString}`)}\u00B0`;
      } else {
        this.$refs.cs.style.cursor = 'default';
        this.box.label.show = false;
      }
    },
    handleMouseMoved(movement) {
      const picked = this.pickObject(movement.endPosition);
      if (picked) {
        this.selectPointer(picked);
      } else {
        this.pickImageryLayerFeature(movement.endPosition, (featureInfo) => {
          this.selectPointer(featureInfo);
        });
      }
    },
    flyTo({ latitude, longitude, height }) {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      });
    },
    setBillboard(billboard) {
      const entities = this.viewer.entities.values;
      const billboards = entities.filter((entity) => !!entity.billboard);
      billboards.forEach((entity) => {
        this.viewer.entities.remove(entity);
      });

      if (billboard) {
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            billboard.longitude,
            billboard.latitude,
          ),
          billboard: billboard.billboard,
        });
      }
    },
  },

  computed: {
    position() {
      return {
        latitude: this.latitude,
        longitude: this.longitude,
        height: this.height,
      };
    },
  },

  watch: {
    billboard(billboard) {
      this.setBillboard(billboard);
    },
    position(pos) {
      this.flyTo(pos);
    },
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
      destination: Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude, this.height),
    });
    this.getGeoFeaturesForRect({ cruiseName: this.cruiseName, rect: this.viewRect });
    this.setBillboard(this.billboard);
    this.flyTo(this.position);
  },
};
</script>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped>

</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
