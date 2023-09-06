/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line max-classes-per-file
import {
  UrlTemplateImageryProvider, DeveloperError, defined, Resource,
  Cartesian3, ImageryProvider, DataSource, Entity, Request,
} from 'cesium';
import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import EntityFactory from './EntityFactory';

const POINT_FEATURE = 1;
const LINESTRING_FEATURE = 2;
const POLYGON_FEATURE = 3;

// copied from UrlTemplateImageryProvider
const templateRegex = /{[^}]+}/g;
function buildImageResource(imageryProvider: ImageryProvider, x: number, y: number, level: number, request: Request) {
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  const resource = imageryProvider._resource;
  const url = resource.getUrlComponent(true);
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  const allTags = imageryProvider._tags;
  const templateValues = {};

  const match = url.match(templateRegex);
  if (defined(match)) {
    // @ts-ignore
    match.forEach((tag) => {
      const key = tag.substring(1, tag.length - 1); // strip {}
      if (defined(allTags[key])) {
        // @ts-ignore
        templateValues[key] = allTags[key](imageryProvider, x, y, level);
      }
    });
  }

  return resource.getDerivedResource({
    request,
    templateValues,
  });
}

function createGridCanvas(x: string, y: string, z: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  canvas.setAttribute('data-x', x);
  canvas.setAttribute('data-y', y);
  canvas.setAttribute('data-z', z);

  return canvas;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pointToCoordinate(point: any, xExtent: number, yExtent: number, west: number, north: number) {
  const degX = west + (xExtent * point.x);
  const degY = north - (yExtent * point.y);
  return Cartesian3.fromDegrees(degX, degY);
}

export class MapboxVectorTileImageryProvider extends UrlTemplateImageryProvider {
  public readonly dataSource: DataSource;
  public readonly visibleTiles = {};
  private readonly entityFactory: EntityFactory;

  constructor(options: UrlTemplateImageryProvider.ConstructorOptions, dataSource: DataSource, entityFactory: EntityFactory) {
    super(options);
    this.dataSource = dataSource;
    this.entityFactory = entityFactory;
  }

  // eslint-disable-next-line class-methods-use-this
  requestImage(x: number, y: number, level: number, request: Request) {
    if (!this.ready) {
      throw new DeveloperError(
        'requestImage must not be called before the imagery provider is ready.',
      );
    }

    const p = Resource.fetchArrayBuffer(buildImageResource(this, x, y, level, request));
    if (!p) {
      return p;
    }

    const {
      west, south, east, north,
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
    } = this._tilingScheme.tileXYToNativeRectangle(x, y, level);

    const tileKey = `${x}_${y}_${level}`;

    return p.then((buffer) => {
      this.dataSource.entities.suspendEvents();

      const mvt = new VectorTile(new Protobuf(buffer));
      // eslint-disable-next-line no-unused-vars

      const entities: Array<Entity> = [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(mvt.layers).forEach(([layerName, layer]) => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const xExtent = Math.abs(east - west) / layer.extent;
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const yExtent = Math.abs(north - south) / layer.extent;
        // @ts-ignore
        for (let i = 0; i < layer.length; i++) {
          // @ts-ignore
          const feature = layer.feature(i);
          const geometry = feature.loadGeometry();
          if (feature.type === POINT_FEATURE) {
            const point = geometry[0][0];
            // @ts-ignore
            const entityOptions = this.entityFactory.point(layer, feature, point);
            if (entityOptions) {
              entityOptions.position = pointToCoordinate(point, xExtent, yExtent, west, north);
              entityOptions.show = true;
              const entity = this.dataSource.entities.add(new Entity(entityOptions));
              entities.push(entity);
            }
          } else if (feature.type === LINESTRING_FEATURE) {
            if (geometry.length) {
              // @ts-ignore
              geometry.forEach((lineString) => {
                // @ts-ignore
                const entityOptions = this.entityFactory.lineString(layer, feature, lineString);
                if (entityOptions) {
                  entityOptions.show = true;
                  // @ts-ignore
                  entityOptions.polyline.positions = lineString.map((point) => {
                    // @ts-ignore
                    const xCoord = point.x;
                    const yCoord = point.y;
                    const degX = west + (xExtent * xCoord);
                    const degY = north - (yExtent * yCoord);
                    // @ts-ignore
                    return Cartesian3.fromDegrees(degX, degY);
                  });
                  if (entityOptions.polyline?.positions && (entityOptions.polyline?.positions as Array<Cartesian3>).length > 1) {
                    const entity = this.dataSource.entities.add(entityOptions);
                    entities.push(entity);
                  }
                }
              });
            }
          } else if (feature.type === POLYGON_FEATURE) { /* empty */ }
        }
      });
      // @ts-ignore
      this.visibleTiles[tileKey] = entities;

      this.dataSource.entities.resumeEvents();
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      this.dataSource._changed.raiseEvent(this.dataSource);

      return createGridCanvas(`${x}`, `${y}`, `${level}`);
    });
  }
}
