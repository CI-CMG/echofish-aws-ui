<template>
  <div>
    <b-breadcrumb :items="items"/>
    <div class="m-2">
      <h4>Job: {{dataset.jobId}}</h4>
      <h4>Status: {{dataset.jobStatus}}</h4>
      <IngestControlCard :status="dataset.jobStatus" :unlock="unlock" :start="start" />
      <StatusCard
        :processing="dataset.raw2ZarrProcessing"
        :completed="dataset.raw2ZarrCompleted"
        :errors="dataset.raw2ZarrError"
        :zarrAccumulationStatus="dataset.zarrAccumulationStatus"
        :geoJsonStatus="dataset.geoJsonGenerationStatus"
        :mapTileStatus="dataset.mapTileGenerationStatus"
      />
      <ErrorCard :errors="dataset.errors" :raw2ZarrErrors="dataset.raw2ZarrError"/>
      <FileCard :processing="dataset.raw2ZarrProcessing" :completed="dataset.raw2ZarrCompleted"/>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import IngestControlCard from './IngestControlCard.vue';
import StatusCard from './StatusCard.vue';
import ErrorCard from './ErrorCard.vue';
import FileCard from './FileCard.vue';

export default {
  components: {
    IngestControlCard,
    StatusCard,
    ErrorCard,
    FileCard,
  },
  props: ['platform', 'survey', 'instrument'],
  computed: {
    ...mapGetters({
      dataset: 'dataset/dataset',
      loading: 'dataset/loading',
    }),
    items() {
      return [
        {
          text: 'EchoFish',
          to: { name: 'EchoFish' },
        },
        {
          text: 'Dataset',
          to: { name: 'Datasets' },
        },
        {
          text: `${this.platform} : ${this.survey} : ${this.instrument}`,
          active: true,
        },
      ];
    },
  },
  methods: {
    ...mapActions({
      load: 'dataset/load',
    }),
    unlock() {

    },
    start() {

    },
  },
};
</script>
