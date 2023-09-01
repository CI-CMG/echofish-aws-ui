import { calculateGeohashString } from '../../../src/utils/geohash';

test('test geohash string', () => {
  const lat = 37.77564;
  const lon = -122.41365;
  const bits = 25;
  const hash = calculateGeohashString(lon, lat, bits);
  expect(hash).toBe('9q8yy');
});
