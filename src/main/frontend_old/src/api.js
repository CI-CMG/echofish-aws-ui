import axios from 'axios';
import { API_BASE_PATH } from '@/basePath';

const service = axios.create();

service.defaults.baseURL = API_BASE_PATH;
service.defaults.timeout = 60000;

export default service;
