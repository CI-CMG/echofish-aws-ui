import EntityFactory from '@/lib/cesium-mvt/EntityFactory';
import { Color, Entity } from 'cesium';

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

export default class MvtEntityFactory implements EntityFactory {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  lineString(layer: VectorTileLayer, feature: VectorTileFeature, points: Array<Point>): Entity.ConstructorOptions | undefined {
    return {
      polyline: {
        width: 3,
        material: Color.DEEPPINK,
      },
      properties: feature.properties,
    };
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  point(layer: VectorTileLayer, feature: VectorTileFeature, point: Point): Entity.ConstructorOptions | undefined {
    return {
      point: {
        // pixelSize: 10,
      },
    };
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  polygon(layer: VectorTileLayer, feature: VectorTileFeature, points: Array<Array<Point>>): Entity.ConstructorOptions | undefined {
    return undefined;
  }
}
