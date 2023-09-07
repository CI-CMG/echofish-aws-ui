import axios from 'axios';
import { ZARR_BASE_URL } from '@/basePath';

const service = axios.create();

service.defaults.baseURL = ZARR_BASE_URL;
service.defaults.timeout = 60000;

export default service;
