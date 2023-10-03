/* eslint-disable class-methods-use-this,no-underscore-dangle */
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  Ellipsoid,
  GeographicTilingScheme,
  HorizontalOrigin,
  LabelCollection,
  LabelStyle,
  Material,
  Math as CesiumMath,
  PolylineCollection,
  Rectangle,
  Request,
  Scene,
  SceneMode,
  TextureMagnificationFilter,
  TextureMinificationFilter,
  TileCoordinatesImageryProvider,
  VerticalOrigin,
} from 'cesium';
import { GraticuleConfig } from './GraticuleConfig';

const HEIGHT = 0.0002;
const PI2 = 2.0 * Math.PI;

const mins = [
  CesiumMath.toRadians(0.05),
  CesiumMath.toRadians(0.1),
  CesiumMath.toRadians(0.2),
  CesiumMath.toRadians(0.5),
  CesiumMath.toRadians(1.0),
  CesiumMath.toRadians(2.0),
  CesiumMath.toRadians(5.0),
  CesiumMath.toRadians(10.0),
];

const addPolyLine = (graticule: Graticule, ellipsoid: Ellipsoid, path: Cartographic[]) => {
  graticule.polylines.add({
    positions: ellipsoid.cartographicArrayToCartesianArray(path),
    height: HEIGHT,
    width: 1,
    material: Material.fromType('Color', { color: graticule.color }),
  });
};

const gridPrecision = (dDeg: number) => {
  if (dDeg < 0.01) return 3;
  if (dDeg < 0.1) return 2;
  if (dDeg < 1) return 1;
  return 0;
};

export class Graticule extends TileCoordinatesImageryProvider {
  readonly polylines: PolylineCollection;
  private readonly _labels: LabelCollection;
  private _zoom: number;
  private _currentExtent?: Rectangle;
  readonly color: Color;
  private _scene: Scene;
  private _show: boolean;
  private readonly _ellipsoid: Ellipsoid;
  private readonly _outlineColor: Color;
  private readonly _outlineWidth: number;
  private readonly _canvas: HTMLCanvasElement;

  constructor(scene: Scene, options?: GraticuleConfig) {
    const defaultConfig: GraticuleConfig = {
      defaultAlpha: 1.0,
      defaultBrightness: 1.0,
      defaultContrast: 1.0,
      defaultHue: 0.0,
      defaultSaturation: 1.0,
      defaultGamma: 1.0,
      defaultMinificationFilter: TextureMinificationFilter.LINEAR,
      defaultMagnificationFilter: TextureMagnificationFilter.LINEAR,
      color: Color.GRAY,
      outlineColor: Color.WHITE,
      outlineWidth: 3,
      tilingScheme: new GeographicTilingScheme(),
      tileWidth: 64,
      tileHeight: 64,
      show: true,
    };

    let config: GraticuleConfig;
    if (options) {
      config = { ...defaultConfig, ...options };
    } else {
      config = { ...defaultConfig };
    }
    super(config);

    this._zoom = 0;
    this.color = config.color;
    this._scene = scene;
    this._ellipsoid = scene.globe.ellipsoid;
    this._show = config.show;
    this._canvas = document.createElement('canvas');
    this._canvas.width = 256;
    this._canvas.height = 256;
    this._outlineColor = config.outlineColor;
    this._outlineWidth = config.outlineWidth;

    this.polylines = new PolylineCollection();
    this._labels = new LabelCollection();

    scene.primitives.add(this._labels);
    scene.primitives.add(this.polylines);
  }

  makeLabel(lng: number, lat: number, text: string, top: boolean) {
    this._labels.add({
      position: this._ellipsoid.cartographicToCartesian(new Cartographic(lng > PI2 ? lng - PI2 : lng, lat, 10.0)),
      text,
      font: '15px sans-serif',
      fillColor: this.color,
      outlineColor: this._outlineColor,
      outlineWidth: this._outlineWidth,
      style: LabelStyle.FILL_AND_OUTLINE,
      horizontalOrigin: HorizontalOrigin.LEFT,
      verticalOrigin: top ? VerticalOrigin.BOTTOM : VerticalOrigin.TOP,
      pixelOffset: new Cartesian2(5, top ? 5 : -5),
      eyeOffset: Cartesian3.ZERO,
    });
  }

  _drawGrid(extent: Rectangle) {
    if (this._currentExtent && this._currentExtent.equals(extent)) {
      return;
    }
    this._currentExtent = extent;

    this.polylines.removeAll();
    this._labels.removeAll();

    let dLat = 0;
    let dLng = 0;

    const north = extent.north;
    const south = extent.south;
    let east = extent.east;
    const west = extent.west;

    if (east < west) {
      // crossing the antimeridian
      east = PI2 + east;
    }

    // get the nearest to the calculated value
    for (let index = 0; index < mins.length && dLat < ((north - south) / 10); index += 1) {
      dLat = mins[index];
    }
    for (let index = 0; index < mins.length && dLng < ((east - west) / 10); index += 1) {
      dLng = mins[index];
    }

    // round iteration limits to the computed grid interval
    let minLng = (west < 0 ? Math.ceil(west / dLng) : Math.floor(west / dLng)) * dLng;
    let minLat = (south < 0 ? Math.ceil(south / dLat) : Math.floor(south / dLat)) * dLat;
    let maxLng = (east < 0 ? Math.ceil(east / dLat) : Math.floor(east / dLat)) * dLat;
    let maxLat = (north < 0 ? Math.ceil(north / dLng) : Math.floor(north / dLng)) * dLng;

    // extend to make sure we cover for non refresh of tiles
    minLng = Math.max(minLng - (2 * dLng), -Math.PI);
    // eslint-disable-next-line operator-assignment
    maxLng = maxLng + (2 * dLng);
    minLat = Math.max(minLat - (2 * dLat), -Math.PI / 2);
    maxLat = Math.min(maxLat + (2 * dLng), Math.PI / 2);

    const ellipsoid = this._ellipsoid;
    const granularity = CesiumMath.toRadians(1);

    // labels positions
    const latitudeText = minLat + (Math.floor((maxLat - minLat) / dLat / 2) * dLat);
    for (let lng = minLng; lng < maxLng; lng += dLng) {
      // draw meridian
      const path = [];
      for (let lat = minLat; lat < maxLat; lat += granularity) {
        path.push(new Cartographic(lng > PI2 ? lng - PI2 : lng, lat, HEIGHT));
      }
      path.push(new Cartographic(lng > PI2 ? lng - PI2 : lng, maxLat, HEIGHT));
      addPolyLine(this, ellipsoid, path);
      let degLng = CesiumMath.toDegrees(lng);
      if (degLng > 180) {
        degLng -= 360;
      }
      this.makeLabel(lng, latitudeText, degLng.toFixed(gridPrecision(dLng)), false);
    }

    // lats
    const longitudeText = minLng + (Math.floor((maxLng - minLng) / dLng / 2) * dLng);
    for (let lat = minLat; lat < maxLat; lat += dLat) {
      // draw parallels
      const path = [];
      for (let lng = minLng; lng < maxLng; lng += granularity) {
        path.push(new Cartographic(lng, lat, HEIGHT));
      }
      path.push(new Cartographic(maxLng, lat, HEIGHT));
      addPolyLine(this, ellipsoid, path);
      const degLat = CesiumMath.toDegrees(lat);
      this.makeLabel(longitudeText, lat, degLat.toFixed(gridPrecision(dLat)), true);
    }
  }

  _getExtentView() {
    if (this._zoom <= 4) {
      return Rectangle.MAX_VALUE;
    }

    const camera = this._scene.camera;
    if (this._scene.mode === SceneMode.SCENE2D) {
      // https://github.com/AnalyticalGraphicsInc/cesium/issues/4346
      const canvas = this._scene.canvas;
      const corners = [
        camera.pickEllipsoid(new Cartesian2(0, 0), this._ellipsoid),
        camera.pickEllipsoid(new Cartesian2(canvas.width, 0), this._ellipsoid),
        camera.pickEllipsoid(new Cartesian2(0, canvas.height), this._ellipsoid),
        camera.pickEllipsoid(new Cartesian2(canvas.width, canvas.height), this._ellipsoid),
      ];
      for (let index = 0; index < 4; index += 1) {
        if (corners[index] === undefined) {
          return Rectangle.MAX_VALUE;
        }
      }

      const extent = Rectangle.fromCartographicArray(this._ellipsoid.cartesianArrayToCartographicArray(corners as Cartesian3[]));

      const east = extent.east;
      const west = extent.west;

      if (east <= west) {
        return Rectangle.MAX_VALUE;
      }

      return extent;
    }

    const rectangle = new Rectangle();
    Rectangle.clone(Rectangle.MAX_VALUE, rectangle);
    camera.computeViewRectangle(this._ellipsoid, rectangle);
    return rectangle;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestImage(x: number, y: number, level: number, request?: Request): Promise<HTMLCanvasElement> {
    this._zoom = level;
    if (this._show) {
      this._drawGrid(this._getExtentView());
    }
    return Promise.resolve(this._canvas);
  }

  setVisible(visible: boolean) {
    this._show = visible;
    if (!visible) {
      this.polylines.removeAll();
      this._labels.removeAll();
    } else {
      this._currentExtent = undefined;
      this._drawGrid(this._getExtentView());
    }
  }

  isVisible() {
    return this._show;
  }
}
