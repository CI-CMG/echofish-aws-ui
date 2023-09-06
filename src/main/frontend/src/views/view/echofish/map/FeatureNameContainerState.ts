import * as Cesium from 'cesium';

export default class FeatureNameContainerState {
  public fncEntities: Array<Cesium.Entity> = [];
  public fncSelectable = false;
  public fncTop = 0;
  public fncLeft = 0;
  public fncLocked = false;
  public fncLongitude = 0;
  public fncLatitude = 0;
}
