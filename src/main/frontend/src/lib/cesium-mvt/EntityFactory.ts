import { Entity } from 'cesium';

type Point = {
  x: number,
  y: number,
};

type VectorTileLayer = {
  version: number,
  name: string,
  extent: number,
  length: number,
};

type VectorTileFeature = {
  type: number,
  extent: number,
  id?: number,
  properties?: any,
};

export default interface EntityFactory {
  point(layer: VectorTileLayer, feature: VectorTileFeature, point: Point): Entity.ConstructorOptions | undefined;
  lineString(layer: VectorTileLayer, feature: VectorTileFeature, points: Array<Point>): Entity.ConstructorOptions | undefined;
  polygon(layer: VectorTileLayer, feature: VectorTileFeature, points: Array<Array<Point>>): Entity.ConstructorOptions | undefined;
}
