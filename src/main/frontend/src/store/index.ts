import { createStore, Store, useStore as baseUseStore } from 'vuex';

import { State } from '@/types/State';
import { InjectionKey } from 'vue';

export const store = createStore<State>({
  state: {} as State,
  getters: {},
  mutations: {},
  actions: {},
  modules: {},
});

export const key: InjectionKey<Store<State>> = Symbol('key for injecting the root vuex store');

export function useStore(): Store<State> {
  return baseUseStore(key);
}
