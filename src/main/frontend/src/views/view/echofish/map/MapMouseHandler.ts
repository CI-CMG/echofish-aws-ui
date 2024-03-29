import * as Cesium from 'cesium';
import debounce from 'lodash.debounce';
import toNumber from 'lodash.tonumber';
import FeatureNameContainerState from '@/views/view/echofish/map/FeatureNameContainerState';
import { Router } from 'vue-router';
import {
  openArray, HTTPStore,
} from 'zarr';
import { ZARR_BASE_URL } from '@/basePath';
import GeoHashFinder from '@/views/view/echofish/map/GeoHashFinder';

type CesiumEntityMapType = {
  [id: string]: Cesium.Entity;
};

export default class MapMouseHandler {
  private readonly fnc;
  private readonly router: Router;

  constructor(fnc: FeatureNameContainerState, router: Router) {
    this.fnc = fnc;
    this.router = router;
    this.handleMouseMove = debounce(this.handleMouseMoveInternal, 100).bind(this);
    this.handleLeftClick = this.handleLeftClick.bind(this);
    this.handleEntityClick = this.handleEntityClick.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  handleMouseMove(event: Cesium.ScreenSpaceEventHandler.MotionEvent, viewer: Cesium.Viewer) {
    // replaced by debounce
  }

  handleLeftClick(event: Cesium.ScreenSpaceEventHandler.PositionedEvent, viewer: Cesium.Viewer) {
    const pickedFeatures: Array<Cesium.Entity> = viewer.scene.drillPick(event.position).map((a) => a.id as Cesium.Entity);
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const coordinates = viewer.camera.pickEllipsoid(new Cesium.Cartesian3(event.position.x, event.position.y), ellipsoid);
    if (coordinates) {
      const cartographic = ellipsoid.cartesianToCartographic(coordinates);
      if (pickedFeatures.length === 1) {
        this.clearFeatureNameContainer();
        this.handleEntityClick(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), pickedFeatures[0]);
      } else if (pickedFeatures.length > 1) {
        const deDup: CesiumEntityMapType = {};
        pickedFeatures.forEach((entity) => {
          deDup[`${entity.properties?.getValue(Cesium.JulianDate.now()).shipName}_${entity.properties?.getValue(Cesium.JulianDate.now()).cruiseName}_${entity.properties?.getValue(Cesium.JulianDate.now()).sensorName}`] = entity;
        });
        if (Object.values(deDup).length === 1) {
          this.clearFeatureNameContainer();
          this.handleEntityClick(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), Object.values(deDup)[0]);
        } else {
          this.updateFeatureNameContainer(pickedFeatures, event.position, true);
          this.fnc.fncLocked = true;
        }
      } else if (this.fnc.fncLocked) {
        this.clearFeatureNameContainer();
      }
    }
  }

  private handleMouseMoveInternal(event: Cesium.ScreenSpaceEventHandler.MotionEvent, viewer: Cesium.Viewer) {
    const pickedFeatures: Array<Cesium.Entity> = viewer.scene.drillPick(event.endPosition).map((a) => a.id as Cesium.Entity);
    this.updateFeatureNameContainer(pickedFeatures, event.endPosition, false);
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const coordinates = viewer.camera.pickEllipsoid(new Cesium.Cartesian3(event.endPosition.x, event.endPosition.y), ellipsoid);
    if (coordinates) {
      const cartographic = ellipsoid.cartesianToCartographic(coordinates);
      this.fnc.fncLatitude = toNumber(Cesium.Math.toDegrees(cartographic.latitude).toFixed(5));
      this.fnc.fncLongitude = toNumber(Cesium.Math.toDegrees(cartographic.longitude).toFixed(5));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public handleEntityClick(longitude: number, latitude: number, pickedFeature: Cesium.Entity) {
    if (pickedFeature.properties && pickedFeature.properties?.getValue(Cesium.JulianDate.now()).shipName) {
      const shipName: string = pickedFeature.properties?.getValue(Cesium.JulianDate.now()).shipName;
      const cruiseName: string = pickedFeature.properties?.getValue(Cesium.JulianDate.now()).cruiseName;
      const sensorName: string = pickedFeature.properties?.getValue(Cesium.JulianDate.now()).sensorName;
      const geoHashFinder = new GeoHashFinder(shipName, cruiseName, sensorName);
      geoHashFinder.find(longitude, latitude).then((storeIndex) => {
        const store = new HTTPStore(`${ZARR_BASE_URL}/level_2/${shipName}/${cruiseName}/${sensorName}/${cruiseName}.zarr`);
        openArray({ store, path: 'frequency', mode: 'r' })
          .then((frequencyArray) => frequencyArray.get())
          .then((nestedArray: any) => Array.from(nestedArray.data))
          .then((frequencies) => frequencies[0] as number)
          .then((frequency: number) => {
            this.router.push({
              name: 'cruise',
              params: {
                shipName,
                cruiseName,
                sensorName,
                storeIndex,
                depthIndex: 0,
                frequency,
              },
            });
          });
      });
    }
  }

  private clearFeatureNameContainer() {
    this.fnc.fncLocked = false;
    this.fnc.fncEntities = [];
    this.fnc.fncSelectable = false;
  }

  private updateFeatureNameContainer(pickedFeatures: Array<Cesium.Entity>, position: Cesium.Cartesian2, selectable: boolean) {
    const filteredFeatures = pickedFeatures.filter((pickedFeature) => pickedFeature.properties && pickedFeature.properties.getValue(Cesium.JulianDate.now()).shipName);
    if (selectable || !this.fnc.fncLocked) {
      if (filteredFeatures.length) {
        const deDup: CesiumEntityMapType = {};
        filteredFeatures.forEach((entity) => {
          deDup[`${entity.properties?.getValue(Cesium.JulianDate.now()).shipName}_${entity.properties?.getValue(Cesium.JulianDate.now()).cruiseName}_${entity.properties?.getValue(Cesium.JulianDate.now()).sensorName}`] = entity;
        });
        this.fnc.fncEntities = Object.values(deDup);
        this.fnc.fncEntities.sort();
        this.fnc.fncLeft = position.x + 7;
        this.fnc.fncTop = position.y + 7;
        this.fnc.fncSelectable = selectable;
      } else if (this.fnc.fncEntities.length) {
        this.clearFeatureNameContainer();
      }
    }
  }
}
