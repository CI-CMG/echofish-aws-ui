<template>
  <b-card border-variant="primary"
          header="Ingest Control"
          header-bg-variant="primary"
          class="mb-2"
  >
    <div v-if="status === 'processing'" class="text-center">
      <span class="text-info h4 mr-2">Processing</span>
      <b-spinner variant="info" label="Processing"></b-spinner>
      <b-button variant="danger" class="ml-3" @click="unlock">Unlock</b-button>
    </div>
    <template v-else>
      <b-button v-if="ready" @click="start" variant="primary" class="mb-2 mr-sm-2 mb-sm-0">Start Ingest</b-button>
    </template>
  </b-card>
</template>

<script>
export default {
  props: [
    'status',
    'unlock',
    'start',
  ],
};
</script>
