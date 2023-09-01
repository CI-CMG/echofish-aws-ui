<template>
  <b-card no-body
          border-variant="primary"
          header="Errors"
          header-bg-variant="primary"
          class="mb-2">

    <b-card-body>
      <b-list-group>
        <b-list-group-item v-for="(error, index) in errors" :key="index">
          {{error}}
        </b-list-group-item>
      </b-list-group>
      <b-table striped outlined small hover :items="raw2ZarrErrors" :fields="fields" />
    </b-card-body>

  </b-card>
</template>

<script>
export default {
  props: [
    'errors',
    'raw2ZarrErrors',
  ],
  data() {
    return {
      fields: {
        fields: [
          {
            key: 'file',
            label: 'File',
          },
          {
            key: 'error',
            label: 'Error',
          },
        ],
      },
    };
  },
};
</script>
