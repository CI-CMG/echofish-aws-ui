/* eslint-disable no-bitwise */

// https://en.wikipedia.org/wiki/Geohash#Example

const BASE_32 = [
  '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9', 'b', 'c', 'd', 'e', 'f', 'g',
  'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
];

export const splitToDecimalArray = (hash, bits) => {
  const result = [];
  let val = hash;
  const c = Math.ceil(bits / 5);
  for (let i = 0; i < c; i += 1) {
    result.unshift(val & 31);
    val >>>= 5;
  }
  return result;
};

export const decimalToGeohashBase32 = (hash, bits) => {
  const parts = splitToDecimalArray(hash, bits);
  let result = '';
  for (let i = 0; i < parts.length; i += 1) {
    result = `${result}${BASE_32[parts[i]]}`;
  }
  return result;
};

export const calculateGeohash = (lon, lat, bits) => {
  let minLat = -90;
  let maxLat = 90;
  let minLon = -180;
  let maxLon = 180;
  let result = 0;
  for (let i = 0; i < bits; ++i) {
    if (i % 2 === 0) { // even bit: bisect longitude
      const midpoint = (minLon + maxLon) / 2;
      if (lon < midpoint) {
        result <<= 1; // push a zero bit
        maxLon = midpoint; // shrink range downwards
      } else {
        // eslint-disable-next-line no-mixed-operators
        result = result << 1 | 1; // push a one bit
        minLon = midpoint; // shrink range upwards
      }
    } else { // odd bit: bisect latitude
      const midpoint = (minLat + maxLat) / 2;
      if (lat < midpoint) {
        result <<= 1; // push a zero bit
        maxLat = midpoint; // shrink range downwards
      } else {
        // eslint-disable-next-line no-mixed-operators
        result = result << 1 | 1; // push a one bit
        minLat = midpoint; // shrink range upwards
      }
    }
  }

  return result;
};

export const calculateGeohashString = (lon, lat, bits) => decimalToGeohashBase32(calculateGeohash(lon, lat, bits), bits);
