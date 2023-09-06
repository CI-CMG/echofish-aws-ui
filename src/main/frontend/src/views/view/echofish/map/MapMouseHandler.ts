import * as Cesium from 'cesium';
import debounce from 'lodash.debounce';
import toNumber from 'lodash.tonumber';
import FeatureNameContainerState from '@/views/view/echofish/map/FeatureNameContainerState';

type CesiumEntityMapType = {
  [id: string]: Cesium.Entity;
};

export default class MapMouseHandler {
  private readonly fnc;

  constructor(fnc: FeatureNameContainerState) {
    this.fnc = fnc;
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
    if (pickedFeatures.length === 1) {
      this.clearFeatureNameContainer();
      this.handleEntityClick(pickedFeatures[0]);
    } else if (pickedFeatures.length > 1) {
      this.updateFeatureNameContainer(pickedFeatures, event.position, true);
      this.fnc.fncLocked = true;
    } else if (this.fnc.fncLocked) {
      this.clearFeatureNameContainer();
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
  public handleEntityClick(pickedFeature: Cesium.Entity) {
    const shipName: string = pickedFeature.properties?.getValue(Cesium.JulianDate.now()).shipName;
    const cruiseName: string = pickedFeature.properties?.getValue(Cesium.JulianDate.now()).cruiseName;
    const sensorName: string = pickedFeature.properties?.getValue(Cesium.JulianDate.now()).sensorName;
    console.log(`${shipName}_${cruiseName}_${sensorName}`);
  }

  private clearFeatureNameContainer() {
    this.fnc.fncLocked = false;
    this.fnc.fncEntities = [];
    this.fnc.fncSelectable = false;
  }

  private updateFeatureNameContainer(pickedFeatures: Array<Cesium.Entity>, position: Cesium.Cartesian2, selectable: boolean) {
    if (selectable || !this.fnc.fncLocked) {
      if (pickedFeatures.length) {
        const deDup: CesiumEntityMapType = {};
        pickedFeatures.forEach((entity) => {
          deDup[`${entity.properties?.getValue(Cesium.JulianDate.now()).shipName}_${entity.properties?.getValue(Cesium.JulianDate.now()).cruiseName}_${entity.properties?.getValue(Cesium.JulianDate.now()).sensorName}`] = entity;
        });
        this.fnc.fncEntities = Object.values(deDup);
        this.fnc.fncEntities.sort();
        this.fnc.fncLeft = position.x + 7;
        this.fnc.fncTop = position.y + 7;
        this.fnc.fncSelectable = selectable;
        console.log(this.fnc.fncEntities);
      } else if (this.fnc.fncEntities.length) {
        this.clearFeatureNameContainer();
        console.log(this.fnc.fncEntities);
      }
    }
  }
}
