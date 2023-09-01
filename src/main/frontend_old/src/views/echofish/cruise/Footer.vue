<template>
  <span>
   <ColorPalette :selectedColorPalette="selectedColorPalette" :min="min" :max="max"/>
  </span>
</template>

<script>
import { mapGetters } from 'vuex';
import ColorPalette from './ColorPalette.vue';

export default {
  components: {
    ColorPalette,
  },
  computed: {
    ...mapGetters({
      sliderValues: 'cruiseView/sliderValues',
      selectedColorPalette: 'cruiseView/selectedColorPalette',
    }),
    min() {
      return this.sliderValues[0];
    },
    max() {
      return this.sliderValues[1];
    },
  },
};
</script>
