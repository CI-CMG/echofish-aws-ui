<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<template>
    <div class="waterColumnDashboard">

        <p class="cruiseTitle">
          CRUISE: {{ cruiseName.toUpperCase() }}
        </p><hr />

        <PointerValues />

        <TimeValues />

        <FrequencySelector /><br />

        <ColorPaletteValues />

        <hr />
        <SliderSelector />

        <p>last value clicked: <b style="font-size: 1.25em;">{{ this.lastPixelColor }}</b></p>

    </div>
</template>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<script>

import { mapState } from 'vuex';
import store from '@/store/store';
import PointerValues from './PointerValues.vue';
import TimeValues from './TimeValues.vue';
import FrequencySelector from './FrequencySelector.vue';
import ColorPaletteValues from './ColorPaletteValues.vue';
import SliderSelector from './SliderSelector.vue';

export default {
  name: 'WaterColumnDashboard',

  components: {
    PointerValues,
    TimeValues,
    FrequencySelector,
    ColorPaletteValues,
    SliderSelector,
  },

  computed: {
    ...mapState('cruiseView', ['cruiseName']),
    lastPixelColor: {
      get() {
        return store.state.cruiseView.lastPixelColor;
      },
      set(value) {
        this.$store.dispatch('cruiseView/updateLastPixelColorValue', value);
      },
    },
  },

};
</script>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped>
  .waterColumnDashboard {
    background-color: floralwhite;
    border: 2px solid darkgrey;
    z-index: 999;
    position: absolute;
    bottom: 15px;
    right: 15px;
    cursor: default;
    text-align: center;
    width: 650px;
  }
  .cruiseTitle {
    font-family: 'Verdana';
    color: slategrey;
    font-weight: bold;
    letter-spacing: 0.5em;
  }
</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
