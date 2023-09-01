<template>
  <b-card no-body
          border-variant="primary"
          header="Files"
          header-bg-variant="primary"
          class="mb-2">

    <b-card-body>
<!--      <b-list-group>-->
<!--        <b-list-group-item v-for="(error, index) in errors" :key="index">-->
<!--          {{error}}-->
<!--        </b-list-group-item>-->
<!--      </b-list-group>-->
      <b-table striped outlined small hover :items="processingFiles" :fields="processingFields" />
      <b-table striped outlined small hover :items="completedFiles" :fields="completedFields" />
    </b-card-body>

  </b-card>
</template>

<script>
export default {
  props: [
    'processing',
    'completed',
  ],
  data() {
    return {
      processingFields: [
        {
          key: 'file',
          label: 'Processing',
        },
      ],
      completedFields: [
        {
          key: 'file',
          label: 'Completed',
        },
      ],
    };
  },
  computed: {
    processingFiles() {
      return this.processing.map((file) => ({ file }));
    },
    completedFiles() {
      return this.completed.map((file) => ({ file }));
    },
  },
};
</script>
