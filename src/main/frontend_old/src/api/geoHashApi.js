import axios from 'axios';
import { GEO_HASH_BASE_PATH } from '../basePath';

const service = axios.create();

service.defaults.baseURL = GEO_HASH_BASE_PATH;
service.defaults.timeout = 60000;

export default service;
