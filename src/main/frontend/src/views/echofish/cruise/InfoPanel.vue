<template>
  <div>
    <div style="width: 100%; height: 150px;">
      <CesiumVue
        ref="map"
        :initial-longitude="67.89"
        :initial-latitude="123.45"
        :initial-height="20000.0"
        :maximum-zoom-distance="25000000"
        :on-path-click="onPathClick"
      />
    </div>
    <div>
      <b-form-checkbox v-model="localTime" name="localTime" switch>
        Local Time
      </b-form-checkbox>
        <span>
    <span>Time: {{time}}</span><span>Lon: {{lon}}</span><span>Lat: {{lat}}</span><span>Depth: {{depth}}</span>
  </span>
      Sunrise ☼ <b>{{ sunrise }}</b>,
      Sunset ☀ <b>{{ sunset }}</b>,
      Moon Phase: <b>{{ moonPhase }}</b>
    </div>
  </div>
</template>

<script>
import CesiumVue from '@/components/cesium/CesiumVue.vue';

export default {
  components: {
    CesiumVue,
  },
  data() {
    return {
      sunrise: '15:22:09+00:00',
      sunset: '15:22:09+00:00',
      moonPhase: 'Waning Gibbous 🌖',
      lat: 0.0,
      lon: 0.0,
      depth: 0.0,
      time: '2021-01-20T15:22:09+00:00',
      localTime: false,
    };
  },
  methods: {
    onPathClick() {

    },
  },
};
</script>
