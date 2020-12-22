<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<template>
    <div class="pointerValues">

      <p>
        Latitude ↕: <b>{{ pointer.latitude }}</b>,
        Longitude ↔:<b>{{ pointer.longitude }}</b>,
        Depth: <b>{{ pointer.depth }} meters</b>
      </p>

<!--        X-Y: <b>({{ pointer.x }}, {{ pointer.y }})</b>-->
<!--      <p>timestamp: <b>{{ pointer.timestamp }}</b></p>-->

    </div>
</template>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<script>

import { mapState } from 'vuex';
import store from '@/store/store';

export default {
  name: 'PointerValues',

  computed: {
    ...mapState('cruiseView', ['pointer']),
    pointerValues: { // v-model requires getters & setters
      get() {
        return store.state.cruiseView.pointerValues;
      },
    },
  },
};
</script>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped>

</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
