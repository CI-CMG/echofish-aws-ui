import * as Cesium from 'cesium';

export default class IndexedDataSource {
  index: number;
  dataSource: Cesium.DataSource;

  constructor(index: number, dataSource: Cesium.DataSource) {
    this.index = index;
    this.dataSource = dataSource;
  }
}
