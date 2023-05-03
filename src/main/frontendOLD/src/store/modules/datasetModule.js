import api from '@/api';

export default {
  namespaced: true,
  state: {
    loading: false,
    dataset: {
      jobId: '12345',
      jobStatus: 'processing',
      raw2ZarrProcessing: [
        'EX1907_EK60-D20191104-T013408.raw',
        'EX1907_EK60-D20191104-T031200.raw',
        'EX1907_EK60-D20191104-T042115.raw',
        'EX1907_EK60-D20191104-T043903.raw',
        'EX1907_EK60-D20191104-T055010.raw',
        'EX1907_EK60-D20191104-T055301.raw',
        'EX1907_EK60-D20191104-T132855.raw',
        'EX1907_EK60-D20191104-T151555.raw',
        'EX1907_EK60-D20191104-T170255.raw',
        'EX1907_EK60-D20191104-T184955.raw',
        'EX1907_EK60-D20191104-T203655.raw',
        'EX1907_EK60-D20191104-T220701.raw',
        'EX1907_EK60-D20191105-T124550.raw',
        'EX1907_EK60-D20191105-T143250.raw',
        'EX1907_EK60-D20191105-T161950.raw',
        'EX1907_EK60-D20191105-T180650.raw',
        'EX1907_EK60-D20191105-T195350.raw',
        'EX1907_EK60-D20191105-T214050.raw',
        'EX1907_EK60-D20191105-T222348.raw',
        'EX1907_EK60-D20191106-T011842.raw',
        'EX1907_EK60-D20191106-T012222.raw',
        'EX1907_EK60-D20191106-T045006.raw',
        'EX1907_EK60-D20191106-T045450.raw',
        'EX1907_EK60-D20191106-T051015.raw',
        'EX1907_EK60-D20191106-T082819.raw',
        'EX1907_EK60-D20191106-T084219.raw',
      ],
      raw2ZarrCompleted: [
        'EX1907_EK60-D20191105-T012702.raw',
        'EX1907_EK60-D20191105-T042133.raw',
        'EX1907_EK60-D20191105-T043643.raw',
        'EX1907_EK60-D20191105-T073908.raw',
        'EX1907_EK60-D20191105-T074202.raw',
        'EX1907_EK60-D20191105-T105850.raw',
      ],
      raw2ZarrError: [
        { file: 'EX1907_EK60-D20191104-T073811.raw', error: 'something is wrong' },
        { file: 'EX1907_EK60-D20191104-T091409.raw', error: 'I am broken' },
        { file: 'EX1907_EK60-D20191104-T114155.raw', error: 'Does not compute' },
      ],
      zarrAccumulationStatus: 'notStarted',
      geoJsonGenerationStatus: 'notStarted',
      mapTileGenerationStatus: 'notStarted',
      errors: [
        'I am a teapot',
        'short and stout',
      ],
    },
  },
  getters: {
    dataset(state) {
      return state.dataset;
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
      return api.get('/admin/dataset-details')
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
