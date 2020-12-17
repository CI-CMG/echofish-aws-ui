import apiService from '@/services/apiService';

export const namespaced = true;

export const state = {
  uploading: false,
  file: {},
};

export const mutations = {
  UPLOAD_REQUEST(_state) {
    _state.uploading = true;
  },
  UPLOAD_SUCCESS(_state) {
    _state.uploading = false;
  },
  UPLOAD_FAILURE(_state) {
    _state.uploading = false;
  },
  ADD_FILE(_state, file) {
    _state.file = file;
  },
};

export const actions = {
  addFile({ commit }, file) {
    commit('ADD_FILE', file);
  },
  uploadFile({ commit, state: _state }) {
    commit('UPLOAD_REQUEST');
    const formData = new FormData();
    formData.append('file', _state.file);
    return apiService.importPointData(formData)
      .then((response) => {
        commit('UPLOAD_SUCCESS');
        return response.data;
      })
      .catch((error) => {
        console.log(error);
        commit('UPLOAD_FAILURE');
      });
  },
};
