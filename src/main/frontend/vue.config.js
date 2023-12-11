const { defineConfig } = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = defineConfig({

  parallel: false,

  chainWebpack: (config) => {
    config.plugin('polyfills').use(NodePolyfillPlugin);
  },

  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },

  outputDir: 'dist',

  assetsDir: 'ui',

  publicPath: process.env.NODE_ENV === 'production' ? '@contextRoot@' : `${process.env.VUE_APP_BASE_URL}`,

  configureWebpack: (config) => {
    config.devtool = process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map';

    config.output.devtoolModuleFilenameTemplate = info => info.resourcePath.match(/^\.\/\S*?\.vue$/)
        ? `webpack-generated:///${info.resourcePath}?${info.hash}`
        : `webpack-yourCode:///${info.resourcePath}`;

    config.output.devtoolFallbackModuleFilenameTemplate = 'webpack:///[resource-path]?[hash]';

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'node_modules/cesium/Build/Cesium/ThirdParty',
            to: 'ui/Cesium/ThirdParty',
          },
          {
            from: 'node_modules/cesium/Build/Cesium/Workers',
            to: 'ui/Cesium/Workers',
          },
          {
            from: 'node_modules/cesium/Build/Cesium/Assets',
            to: 'ui/Cesium/Assets',
          },
          {
            from: 'node_modules/cesium/Build/Cesium/Widgets',
            to: 'ui/Cesium/Widgets',
          },
        ],
      }),
    );
  },

  devServer: {
    port: 8085,
    https: true,
  },

});
