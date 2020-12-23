export default {
  namespaced: true,
  state: {
    errors: [],
    countDown: 0,
  },
  getters: {
    errors(state) {
      return state.errors;
    },
    countDown(state) {
      return state.countDown;
    },
  },
  mutations: {
    addErrors(state, errors) {
      state.errors = [...state.errors, ...errors];
      state.countDown = 20;
    },
    countDown(state, countDown) {
      state.countDown = countDown;
      if (!countDown) {
        state.errors = [];
      }
    },
  },
  actions: {
    addErrors({ commit }, errors) {
      commit('addErrors', errors);
    },
    countDownChanged({ commit }, countDown) {
      commit('countDown', countDown);
    },
    dismissAlert({ dispatch }) {
      dispatch('countDownChanged', 0);
    },
  },
};
