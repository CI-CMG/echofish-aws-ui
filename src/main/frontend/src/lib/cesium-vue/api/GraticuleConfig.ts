import {
  Color, GeographicTilingScheme, TextureMagnificationFilter, TextureMinificationFilter, TileCoordinatesImageryProvider,
} from 'cesium';

export interface GraticuleConfig extends TileCoordinatesImageryProvider.ConstructorOptions {
  defaultAlpha: number,
  defaultBrightness: number,
  defaultContrast: number,
  defaultHue: number,
  defaultSaturation: number,
  defaultGamma: number,
  defaultMinificationFilter: TextureMinificationFilter,
  defaultMagnificationFilter: TextureMagnificationFilter,
  color: Color,
  outlineColor: Color,
  outlineWidth: number,
  tilingScheme: GeographicTilingScheme,
  tileWidth: number,
  tileHeight: number,
  show: boolean,
}
