import * as Cesium from 'cesium';

export default interface ImageryLayerRegistration {
  (imageryLayer: Cesium.ImageryLayer, index: number): void;
}
