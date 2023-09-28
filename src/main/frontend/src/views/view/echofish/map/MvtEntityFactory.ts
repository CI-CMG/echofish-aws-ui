import EntityFactory from '@/lib/cesium-mvt/EntityFactory';
import {
  ArcType, Color, Entity,
} from 'cesium';

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
  '#FAEBD7',
  '#00FFFF',
  '#7FFFD4',
  '#F0FFFF',
  '#F5F5DC',
  '#FFE4C4',
  '#000000',
  '#FFEBCD',
  '#0000FF',
  '#8A2BE2',
  '#A52A2A',
  '#DEB887',
  '#5F9EA0',
  '#7FFF00',
  '#D2691E',
  '#FF7F50',
  '#FFF8DC',
  '#DC143C',
  '#00FFFF',
  '#00008B',
  '#008B8B',
  '#B8860B',
  '#A9A9A9',
  '#006400',
  '#A9A9A9',
  '#BDB76B',
  '#8B008B',
  '#556B2F',
  '#FF8C00',
  '#9932CC',
  '#8B0000',
  '#E9967A',
  '#8FBC8F',
  '#483D8B',
  '#2F4F4F',
  '#2F4F4F',
  '#00CED1',
  '#9400D3',
  '#FF1493',
  '#696969',
  '#696969',
  '#B22222',
  '#228B22',
  '#FF00FF',
  '#DCDCDC',
  '#FFD700',
  '#DAA520',
  '#808080',
  '#008000',
  '#ADFF2F',
  '#808080',
  '#FF69B4',
  '#CD5C5C',
  '#4B0082',
  '#F0E68C',
  '#FFF0F5',
  '#E6E6FA',
  '#7CFC00',
  '#FFFACD',
  '#F08080',
  '#FAFAD2',
  '#D3D3D3',
  '#90EE90',
  '#FFB6C1',
  '#20B2AA',
  '#778899',
  '#778899',
  '#B0C4DE',
  '#FFFFE0',
  '#00FF00',
  '#32CD32',
  '#FAF0E6',
  '#FF00FF',
  '#800000',
  '#66CDAA',
  '#0000CD',
  '#BA55D3',
  '#9370DB',
  '#3CB371',
  '#7B68EE',
  '#00FA9A',
  '#48D1CC',
  '#C71585',
  '#191970',
  '#FFE4E1',
  '#FFE4B5',
  '#FFDEAD',
  '#000080',
  '#FDF5E6',
  '#808000',
  '#6B8E23',
  '#FFA500',
  '#FF4500',
  '#DA70D6',
  '#EEE8AA',
  '#98FB98',
  '#AFEEEE',
  '#DB7093',
  '#FFEFD5',
  '#FFDAB9',
  '#CD853F',
  '#FFC0CB',
  '#DDA0DD',
  '#800080',
  '#FF0000',
  '#BC8F8F',
  '#4169E1',
  '#8B4513',
  '#FA8072',
  '#F4A460',
  '#2E8B57',
  '#A0522D',
  '#C0C0C0',
  '#87CEEB',
  '#6A5ACD',
  '#708090',
  '#708090',
  '#00FF7F',
  '#4682B4',
  '#D2B48C',
  '#008080',
  '#D8BFD8',
  '#FF6347',
  '#40E0D0',
  '#EE82EE',
  '#FFFF00',
  '#9ACD32',
];

export default class MvtEntityFactory implements EntityFactory {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  lineString(layer: VectorTileLayer, feature: VectorTileFeature, points: Array<Point>): Entity.ConstructorOptions | undefined {
    return {
      polyline: {
        width: 3,
        material: Color.fromCssColorString(colorMap[hashCode(layer.name) % colorMap.length]),
        arcType: ArcType.GEODESIC,
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
