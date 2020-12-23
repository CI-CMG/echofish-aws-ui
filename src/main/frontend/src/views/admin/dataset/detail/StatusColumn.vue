<template>
  <b-col cols="auto">
    <b-icon v-if="status === 'error'" icon="x-circle-fill" scale="2" variant="danger"/>
    <b-icon v-else-if="status === 'warning'" icon="exclamation-triangle-fill" scale="2" variant="warning"/>
    <b-icon v-else-if="status === 'complete'" icon="check-circle-fill" scale="2" variant="success"/>
    <b-icon v-else-if="status === 'processing'" icon="circle-fill" scale="2" animation="throb" variant="info"/>
    <b-icon v-else icon="clock-fill" scale="2" variant="info"/>
  </b-col>
</template>

<script>
export default {
  props: ['status'],
};
</script>
