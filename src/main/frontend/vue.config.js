const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  // transpileDependencies: true,
  transpileDependencies: [
    'vuetify',
  ],
  css: {
    extract: false,
  },
});

