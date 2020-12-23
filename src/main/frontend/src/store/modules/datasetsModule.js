import api from '@/api';

export default {
  namespaced: true,
  state: {
    loading: false,
    datasets: [
      { platform: 'Okeanos_Explorer', survey: 'EX1907', instrument: 'EK60' },
      { platform: 'Gunter_Goober', survey: 'GU1002', instrument: 'EK60' },
    ],
  },
  getters: {
    datasets(state) {
      return state.datasets;
    },
    loading(state) {
      return state.loading;
    },
  },
  mutations: {
    request(state) {
      state.loading = true;
      // state.datasets = [];
    },
    success(state, datasets) {
      state.loading = false;
      state.datasets = datasets;
    },
    failure(state) {
      state.loading = false;
    },
  },
  actions: {
    load({ commit }) {
      commit('request');
      return api.get('/admin/dataset')
        .then(
          ({ data }) => {
            commit('success', data.items);
            return data;
          },
          (error) => {
            commit('failure');
            throw error;
          },
        );
    },
  },
};
