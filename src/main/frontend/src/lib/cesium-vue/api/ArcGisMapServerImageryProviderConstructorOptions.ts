import * as Cesium from 'cesium';

export default class ArcGisMapServerImageryProviderConstructorOptions {
  url: Cesium.Resource | string;
  token: string | undefined = undefined;
  tileDiscardPolicy: Cesium.TileDiscardPolicy | undefined = undefined;
  usePreCachedTilesIfAvailable: boolean | undefined = true;
  layers: string | undefined = undefined;
  enablePickFeatures: boolean | undefined = undefined;
  rectangle: Cesium.Rectangle | undefined = Cesium.Rectangle.MAX_VALUE;
  tilingScheme: Cesium.TilingScheme | undefined = new Cesium.GeographicTilingScheme();
  ellipsoid: Cesium.Ellipsoid | undefined = undefined;
  credit: Cesium.Credit | string | undefined = undefined;
  tileWidth: number | undefined = 256;
  tileHeight: number | undefined = 256;
  maximumLevel: number | undefined = undefined;

  constructor(url: Cesium.Resource | string) {
    this.url = url;
  }
}
