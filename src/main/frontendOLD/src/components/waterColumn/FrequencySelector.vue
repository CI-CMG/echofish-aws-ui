<template>
    <div class="FrequencySelector">

      <div class="frequencyContainer">
        <label>Frequency:
          <select v-model="frequency">
            <option v-for="f in frequencies" :key="f">{{ f }}</option>
          </select> kHz,
          [selected: <b>{{ frequency }} kHz</b>]
        </label>
      </div>

    </div>
</template>

<script>

import store from '@/store/store';
import { mapActions } from 'vuex';

export default {
  name: 'frequencySelector',

  computed: {
    frequencies() {
      return store.state.cruiseView.frequencies;
    },
    frequency: {
      get() {
        return store.state.cruiseView.frequency;
      },
      set(value) {
        this.$store.dispatch('cruiseView/updateFrequency', value);
      },
    },
  },

  methods: {
    ...mapActions('cruiseView', [
      'clearData',
      'loadNextData',
      'loadPrevData',
    ]),
  },
};
</script>
