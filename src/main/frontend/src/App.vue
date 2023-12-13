<template>
  <v-app>
    <v-app-bar color="primary">
      <v-btn variant="text">
        <v-app-bar-title @click="goToMap">EchoFish</v-app-bar-title>
      </v-btn>
      <v-spacer />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { Router, useRouter } from 'vue-router';

const router: Router = useRouter();

function goToMap() {
  router.push({
    name: 'map',
  });
}

</script>

<style>
  .v-toolbar-title__placeholder {
    font-weight: 900;
  }
</style>
