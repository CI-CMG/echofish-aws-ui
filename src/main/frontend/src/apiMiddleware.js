import store from '@/store/store';
import api from '@/api';

// eslint-disable-next-line no-unused-vars
export const register = (router) => {
  api.interceptors.request.use((config) => {
    config.auth = store.getters['login/credentials'];
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        store.dispatch('login/clear');
        router.push({ name: 'Login' });
      } else {
        let msg = ['An Unknown Error Occurred'];
        if (error.response && error.response.data && error.response.data.flashErrors) {
          msg = error.response.data.flashErrors;
        }
        store.dispatch('app/addErrors', msg);
      }
      throw error;
    },
  );
};
