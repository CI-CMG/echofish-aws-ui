import * as Cesium from 'cesium';
import { CustomViewer } from '../internal/Custom';

export default interface WidgetEventContext {

  onUpdateDatasource(callback: (datasource: Cesium.DataSource) => void): void;
  onNewViewer(callback: (viewer: CustomViewer) => void): void;
  getViewer(): CustomViewer;
  setInputAction(event: Cesium.ScreenSpaceEventHandler.PositionedEventCallback | Cesium.ScreenSpaceEventHandler.MotionEventCallback | Cesium.ScreenSpaceEventHandler.WheelEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointMotionEventCallback, type: Cesium.ScreenSpaceEventType, modifier?: Cesium.KeyboardEventModifier): void;
  setInputCameraAction(callback: () => void): void;
  updateGlobe(globe: Cesium.Globe) : void;
  updateDataSource(dataSource: Cesium.DataSource, index: number) : void;
  changeSceneMode(sceneMode: Cesium.SceneMode): void;
}
