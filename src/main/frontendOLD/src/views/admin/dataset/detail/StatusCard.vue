<template>
  <b-card no-body
          border-variant="primary"
          header="Ingest Steps"
          header-bg-variant="primary"
          class="mb-2"
  >

    <b-card-body>

        <b-list-group>
          <b-list-group-item>
            <b-container>
              <b-row>
                <b-col>Raw To Zarr Conversion</b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-progress :max="fileCount" show-value>
                    <b-progress-bar :value="completedCount" variant="success" :precision="2" show-progress></b-progress-bar>
                    <b-progress-bar :value="errorCount" variant="danger" :precision="2" show-progress></b-progress-bar>
                  </b-progress>
                  <div>Success: {{ completedCount }}/{{ fileCount }} Errors: {{ errorCount }}</div>
                </b-col >
                <StatusColumn :status="raw2ZarrStatus"/>
              </b-row>
            </b-container>
          </b-list-group-item>
          <b-list-group-item>
            <b-container>
              <b-row>
                <b-col>Zarr Accumulation</b-col>
                <StatusColumn :status="zarrAccumulationStatus"/>
              </b-row>
            </b-container>
          </b-list-group-item>
          <b-list-group-item>
            <b-container>
              <b-row>
                <b-col>GeoJSON Generation</b-col>
                <StatusColumn :status="geoJsonStatus"/>
              </b-row>
            </b-container>
          </b-list-group-item>
          <b-list-group-item>
            <b-container>
              <b-row>
                <b-col>Map Tile Generation</b-col>
                <StatusColumn :status="mapTileStatus"/>
              </b-row>
            </b-container>
          </b-list-group-item>
        </b-list-group>
    </b-card-body>

  </b-card>
</template>

<script>
import StatusColumn from './StatusColumn.vue';

export default {
  components: {
    StatusColumn,
  },
  props: [
    'processing',
    'completed',
    'errors',
    'zarrAccumulationStatus',
    'geoJsonStatus',
    'mapTileStatus',
  ],
  computed: {
    fileCount() {
      return this.processing.length + this.completed.length + this.errors.length;
    },
    completedCount() {
      return this.completed.length;
    },
    errorCount() {
      return this.errors.length;
    },
    raw2ZarrStatus() {
      if (this.processing.length > 0) {
        return 'processing';
      }
      if (this.completed.length > 0) {
        if (this.errors.length > 0) {
          return 'warning';
        }
        return 'complete';
      }
      return 'error';
    },
  },
};
</script>
