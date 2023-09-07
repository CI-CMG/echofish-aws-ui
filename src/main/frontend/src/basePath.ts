// __webpack_public_path__ = window.resourceBasePath.trim();

const trimTrailingSlashes = (path: string) => (path.trim().replace(/\/+$/, ''));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ZARR_BASE_URL = trimTrailingSlashes(window.applicationConfiguration.zarrBaseUrl);
