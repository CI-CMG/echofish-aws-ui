<template>
  <div>
    <b-alert
      :show="countDown"
      dismissible
      variant="danger"
      @dismissed="dismissAlert"
      @dismiss-count-down="countDownChanged"
    >
      <p v-for="error in errors" :key="error">{{error}}</p>
      <b-progress variant="danger" :value="countDown" max="20" height="4px"></b-progress>
    </b-alert>
    <router-view/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions({
      countDownChanged: 'app/countDownChanged',
      dismissAlert: 'app/dismissAlert',
    }),
  },
  computed: {
    ...mapGetters({
      errors: 'app/errors',
      countDown: 'app/countDown',
    }),
  },

};
</script>
