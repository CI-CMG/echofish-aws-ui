import * as Cesium from 'cesium';

type TargetType = Cesium.Entity | Cesium.Entity[] | Cesium.EntityCollection | Cesium.DataSource | Cesium.ImageryLayer | Cesium.Cesium3DTileset | Cesium.TimeDynamicPointCloud | Promise<Cesium.Entity | Cesium.Entity[] | Cesium.EntityCollection | Cesium.DataSource | Cesium.ImageryLayer | Cesium.Cesium3DTileset | Cesium.TimeDynamicPointCloud | Cesium.VoxelPrimitive>;

export default interface FlyToOptions {
  target?: TargetType;
  boundingSphere?: Cesium.BoundingSphere;
  destination?: Cesium.Cartesian3 | Cesium.Rectangle;
  orientation?: any;
  duration?: number;
  endTransform?: Cesium.Matrix4;
  maximumHeight?: number;
  pitchAdjustHeight?: number;
  flyOverLongitude?: number;
  flyOverLongitudeWeight?: number;
  convert?: boolean;
  easingFunction?: Cesium.EasingFunction.Callback;
  offset?: Cesium.HeadingPitchRange;
  destinationIsPolar?: boolean;
}
