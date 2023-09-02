import * as Cesium from 'cesium';
import FrameStateFunction from './FrameStateFunction';

export default interface ImageryLayerOptions {
  rectangle?: Cesium.Rectangle,
  alpha?: number | FrameStateFunction,
  nightAlpha?: number | FrameStateFunction,
  dayAlpha?: number | FrameStateFunction,
  brightness?: number | FrameStateFunction,
  contrast?: number | FrameStateFunction,
  hue?: number | FrameStateFunction,
  saturation?: number | FrameStateFunction,
  gamma?: number | FrameStateFunction,
  splitDirection?: Cesium.SplitDirection | FrameStateFunction,
  minificationFilter?: Cesium.TextureMinificationFilter,
  magnificationFilter?: Cesium.TextureMagnificationFilter,
  show?: boolean,
  maximumAnisotropy?: number,
  minimumTerrainLevel?: number,
  maximumTerrainLevel?: number,
  cutoutRectangle?: Cesium.Rectangle,
  colorToAlpha?: Cesium.Color,
  colorToAlphaThreshold?: number
}
