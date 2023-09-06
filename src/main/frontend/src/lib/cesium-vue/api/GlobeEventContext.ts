import * as Cesium from 'cesium';

export default interface GlobeEventContext {

  registerImageryLayer(imageryLayer: Cesium.ImageryLayer, index: number) : void;
}
