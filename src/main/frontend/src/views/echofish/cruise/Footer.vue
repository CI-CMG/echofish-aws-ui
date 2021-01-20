<template>
  <span>
   <ColorPalette selected-color-palette="viridis" :min="-80" :max="-35"/>
  </span>
</template>

<script>
import ColorPalette from './ColorPalette.vue';

export default {
  components: {
    ColorPalette,
  },
  data() {
    return {
      lat: 0.0,
      lon: 0.0,
      depth: 0.0,
      time: '2021-01-20T15:22:09+00:00',
    };
  },
};
</script>
