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

function hashCode(s: string) {
  let h = 0; const l = s.length; let
    i = 0;
  // eslint-disable-next-line no-bitwise
  if (l > 0) while (i < l) h = (h << 5) - h + s.charCodeAt(i++) | 0;
  return Math.abs(h);
}

const colorMap = [
  '#5F4690',
  '#1D6996',
  '#38A6A5',
  '#0F8554',
  '#73AF48',
  '#EDAD08',
  '#E17C05',
  '#CC503E',
  '#94346E',
  '#6F4070',
  '#994E95',
  '#666666',
];

export default class MvtEntityFactory implements EntityFactory {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  lineString(layer: VectorTileLayer, feature: VectorTileFeature, points: Array<Point>): Entity.ConstructorOptions | undefined {
    return {
      polyline: {
        width: 3,
        material: Color.fromCssColorString(colorMap[hashCode(layer.name) % colorMap.length]),
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
