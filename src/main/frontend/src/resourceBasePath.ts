/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
__webpack_public_path__ = window.applicationConfiguration.contextRoot.trim();

const trimTrailingSlash = (path: string): string => path.replace(/\/$/, '');
// @ts-ignore
export const RAW_BASE_PATH: string = trimTrailingSlash(__webpack_public_path__);
// @ts-ignore
export const VERSION = window.applicationConfiguration.version;
