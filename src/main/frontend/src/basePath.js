// __webpack_public_path__ = window.resourceBasePath.trim();

const trimTrailingSlashes = (path) => (path.trim().replace(/\/+$/, ''));

export const API_BASE_PATH = `${trimTrailingSlashes(window.apiBasePath)}/v1`;
export const MVT_BASE_PATH = trimTrailingSlashes(window.mvtBasePath);

// export const RAW_BASE_PATH = __webpack_public_path__;
// export const RAW_MVT_BASE_PATH = window.mvtBasePath;
