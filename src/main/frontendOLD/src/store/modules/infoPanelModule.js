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
    toggleOpened(state) {
      state.collapsed = false;
    },
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
    toggleOpened({ commit }) {
      commit('toggleOpened');
    },
    toggleCollapsed({ commit }) {
      commit('toggleCollapsed');
    },
    close({ commit }) {
      commit('close');
    },
  },
};
