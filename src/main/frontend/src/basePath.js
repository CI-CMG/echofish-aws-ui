// __webpack_public_path__ = window.resourceBasePath.trim();

const trimTrailingSlashes = (path) => (path.trim().replace(/\/+$/, ''));

export const API_BASE_PATH = `${trimTrailingSlashes(window.apiBasePath)}/v1`;
export const TOKEN_BASE_PATH = trimTrailingSlashes(window.tokenBasePath);
export const MVT_BASE_PATH = trimTrailingSlashes(window.mvtBasePath);
export const CLIENT_ID = window.clientId;
export const CALLBACK_URI = `${window.location.protocol}//${window.location.host}/callback`;
export const STACK_PREFIX = window.stackPrefix;

// export const RAW_BASE_PATH = __webpack_public_path__;
// export const RAW_MVT_BASE_PATH = window.mvtBasePath;
