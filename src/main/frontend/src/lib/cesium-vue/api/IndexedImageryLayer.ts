import * as Cesium from 'cesium';

export default class IndexedImageryLayer {
  index: number;
  imageryLayer: Cesium.ImageryLayer;

  constructor(index: number, imageryLayer: Cesium.ImageryLayer) {
    this.index = index;
    this.imageryLayer = imageryLayer;
  }
}
