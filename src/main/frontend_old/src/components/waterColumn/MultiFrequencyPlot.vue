<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<template>
  <div class="multiFrequencyPlot">
    <LineChartGenerator
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
      :width="width"
      :height="height"
    />
  </div>
</template>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<script>
import { Line as LineChartGenerator } from 'vue-chartjs/legacy';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from 'chart.js';
import { mapGetters } from 'vuex';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
);

export default {
  name: 'MultiFrequencyPlot',

  components: { LineChartGenerator },

  props: {
    chartId: {
      type: String,
      default: 'line-chart',
    },
    datasetIdKey: {
      type: String,
      default: 'label',
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: '',
      type: String,
    },
    styles: {
      type: Object,
      default: () => {
      },
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {};
  },

  computed: {
    ...mapGetters({
      selectedDataSlice: 'cruiseView/selectedDataSlice',
      frequencies: 'cruiseView/frequencies',
    }),
    chartData() {
      return {
        labels: this.frequencies.map((i) => `${i / 1000} kHz`), // TODO: accommodate update for channel ids
        datasets: [
          {
            label: 'Sv Values',
            backgroundColor: '#98ef94',
            data: this.selectedDataSlice,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
      };
    },
  },

  watch: {},

  methods: {},

};
</script>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
<style scoped>

</style>
<!--_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+-->
