import axios from 'axios';
import { resolveApiPath } from '@/services/basePath';
import protos from '@/protos/echogram.proto';

const apiClient = axios.create({
  timeout: 60000,
  baseURL: resolveApiPath(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const formClient = axios.create({
  timeout: 900000,
  baseURL: resolveApiPath(),
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const protobufClient = axios.create({
  timeout: 60000,
  baseURL: resolveApiPath(),
  headers: {
    Accept: 'application/octet-stream',
  },
  responseType: 'arraybuffer',
});

const { tutorial: { Echogram } } = protos;

export default {
  getEchogram(cruiseName, start, end, frequencyKHz) {
    return protobufClient.get(`/visualization-service/api/v1/echogram/${cruiseName}`, {
      params: {
        start, end, frequencyKHz,
      },
    }).then(response => Echogram.toObject(Echogram.decode(new Uint8Array(response.data))));
  },
  importPointData(formData) {
    return formClient.post('/zuul/upload-service/api/v1/wcad', formData);
  },
  getViewMetadata({
    latitude, longitude, cruiseName, frequency,
  }) {
    return apiClient.get(`/v1/cruise/${cruiseName}`, {
      params: {
        latitude, longitude, frequency,
      },
    });
  },
  getGeoFeatures({ type, rect, cruiseName }) {
    const params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: `geomesa:${type}`,
      // maxFeatures: '50',
      outputFormat: 'application/json',
    };

    if (rect) {
      const {
        west, south, east, north,
      } = rect;
      params.srsName = 'EPSG:4326';
      params.bbox = `${south},${west},${north},${east}`;
    }

    if (cruiseName) {
      // TODO why is like required "=" does not seem to work
      params.cql_filer = `cruise_name like '${cruiseName}'`;
    }


    // return apiClient.get('/geoserver/geoserver/geomesa/ows', {
    //   params,
    // });
    return apiClient.get('/v1/cruises');
  },
};
