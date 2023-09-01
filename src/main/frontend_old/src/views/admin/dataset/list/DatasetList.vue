<template>
  <div class="m-2">
    <b-breadcrumb :items="items"/>
    <div v-if="loading">
      <b-spinner/>
    </div>
    <div v-else>
      <b-form inline class="m-2" @submit="onSubmit">
        <b-button type="submit" variant="primary" class="mb-2 mr-sm-2 mb-sm-0">Refresh</b-button>
      </b-form>
      <b-table striped outlined small hover @row-clicked="rowClicked" :items="datasets" :fields="fields" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      items: [
        {
          text: 'EchoFish',
          to: { name: 'EchoFish' },
        },
        {
          text: 'Dataset',
          active: true,
        },
      ],
      fields: [
        {
          key: 'platform',
          label: 'Platform',
          sortable: true,
        },
        {
          key: 'survey',
          label: 'Survey',
          sortable: true,
        },
        {
          key: 'instrument',
          label: 'Instrument',
          sortable: true,
        },
        {
          key: 'importDate',
          label: 'Import Date',
          sortable: true,
        },
      ],
    };
  },
  // beforeRouteEnter(to, from, next) {
  //   next((vm) => {
  //     vm.load();
  //     return true;
  //   });
  // },
  methods: {
    rowClicked(item) {
      const {
        platform,
        survey,
        instrument,
      } = item;
      this.$router.push({
        name: 'DatasetDetail',
        params: {
          platform,
          survey,
          instrument,
        },
      });
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.load();
    },
    ...mapActions({
      load: 'datasets/load',
    }),
  },
  computed: {
    ...mapGetters({
      datasets: 'datasets/datasets',
      loading: 'datasets/loading',
    }),
  },
};
</script>
