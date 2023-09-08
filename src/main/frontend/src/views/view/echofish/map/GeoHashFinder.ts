import zarrApi from '@/api/zarrApi';
import Geohash from 'latlon-geohash';
import * as Cesium from 'cesium';
import { AxiosResponse } from 'axios';

type IndexFileRecord = {
  index: number;
  longitude: number;
  latitude: number;
};

type IndexFile = {
  path: string;
  indexRecords: Array<IndexFileRecord>;
};

export default class GeoHashFinder {
  private shipName: string;
  private cruiseName: string;
  private sensorName: string;

  constructor(shipName: string, cruiseName: string, sensorName: string) {
    this.shipName = shipName;
    this.cruiseName = cruiseName;
    this.sensorName = sensorName;
  }

  // eslint-disable-next-line class-methods-use-this
  private getRing(currentRing: string[], checked: string[]): string[] {
    const nextRing: string[] = [];
    for (let i = 0; i < currentRing.length; i++) {
      const current = currentRing[i];
      const neighbors = Geohash.neighbours(current);
      const safeToCheck = [neighbors.e, neighbors.w];
      if (Geohash.decode(current).lat < 89.5 || Geohash.decode(neighbors.n).lat > 0) {
        safeToCheck.push(neighbors.ne);
        safeToCheck.push(neighbors.n);
        safeToCheck.push(neighbors.nw);
      }
      if (Geohash.decode(current).lat > -89.5 || Geohash.decode(neighbors.s).lat < 0) {
        safeToCheck.push(neighbors.se);
        safeToCheck.push(neighbors.s);
        safeToCheck.push(neighbors.sw);
      }
      safeToCheck.forEach((hash) => {
        if (currentRing.indexOf(hash) < 0 && checked.indexOf(hash) < 0) {
          nextRing.push(hash);
        }
      });
    }
    return nextRing;
  }

  private makeCall(index: number, clickedPoint: Cesium.Cartographic, checked: string[], currentRing: string[]): Promise<number> {
    const geohash = currentRing[index];
    if (!geohash) {
      return Promise.reject(new Error('no more geohashes to check'));
    }
    if (checked.length > 200) {
      return Promise.reject(new Error('exceeded checking maximum geohashes'));
    }
    checked.push(geohash);
    return zarrApi.get(`/spatial/geohash/cruise/${this.shipName}/${this.cruiseName}/${this.sensorName}/${geohash}.json`)
      .then(
        (response) => {
          const indexFile = (response as AxiosResponse).data as IndexFile;
          let minDistance = -1;
          let minIndex = 0;
          indexFile.indexRecords.forEach((record) => {
            const otherPoint = Cesium.Cartographic.fromDegrees(record.longitude, record.latitude);
            const distance = new Cesium.EllipsoidGeodesic(clickedPoint, otherPoint).surfaceDistance;
            if (minDistance === -1 || distance < minDistance) {
              minDistance = distance;
              minIndex = record.index;
            }
          });
          return minIndex;
        },
        (error) => {
          if (error.response && (error.response as AxiosResponse).status === 404) {
            let nextRing = currentRing;
            let nextIndex = index + 1;
            if (nextIndex === currentRing.length) {
              nextRing = this.getRing(currentRing, checked);
              nextIndex = 0;
            }
            return this.makeCall(nextIndex, clickedPoint, checked, nextRing);
          }
          return Promise.reject(error);
        },
      );
  }

  find(longitude: number, latitude: number): Promise<number> {
    const clickedPoint = Cesium.Cartographic.fromDegrees(longitude, latitude);
    const checked: string[] = [];
    const currentRing: string[] = [Geohash.encode(latitude, longitude, 5)];
    return this.makeCall(0, clickedPoint, checked, currentRing);
  }
}
