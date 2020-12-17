<template>
  <div id="app">

    <div id="nav">
      <router-link v-bind:to="{ name: 'map-view' }">
        echofish
      </router-link>
    </div>

    <router-view/>

  </div>
</template>
