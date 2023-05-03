<template>
  <div class="Intro">
    <h2>{{ msg }}</h2>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
// import { onMounted } from 'vue';

@Options({
  props: {
    msg: String,
  },
})
export default class HelloWorld extends Vue {
  msg!: string
}
</script>

<style scoped lang="scss">

</style>
