export default {
  namespaced: true,
  state: {
    collapsed: false,
  },
  getters: {
    collapsed(state) {
      return state.collapsed;
    },
  },
  mutations: {
    toggleCollapsed(state) {
      state.collapsed = !state.collapsed;
    },
    close(state) {
      if (!state.collapsed) {
        state.collapsed = true;
      }
    },
  },
  actions: {
    toggleCollapsed({ commit }) {
      commit('toggleCollapsed');
    },
    close({ commit }) {
      commit('close');
    },
  },
};
