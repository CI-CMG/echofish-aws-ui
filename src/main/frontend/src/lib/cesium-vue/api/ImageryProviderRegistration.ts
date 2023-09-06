import * as Cesium from 'cesium';

export default interface ImageryProviderRegistration {
  (imageryProvider: Cesium.ImageryProvider): void;
}
