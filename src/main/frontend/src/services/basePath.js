import { RAW_BASE_PATH, RAW_MVT_BASE_PATH } from '../resourceBasePath';

const trimTrailingSlashes = (path) => (path.trim().replace(/\/+$/, ''));

export const BASE_PATH = trimTrailingSlashes(RAW_BASE_PATH);
export const MVT_BASE_PATH = trimTrailingSlashes(RAW_MVT_BASE_PATH);

export const resolveApiPath = (endpoint) => {
  const ep = endpoint ? trimTrailingSlashes(endpoint) : '';
  return `${BASE_PATH}${ep}`;
};
