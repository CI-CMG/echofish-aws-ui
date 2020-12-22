const path = require('path');
const webpack = require('webpack');
const CopywebpackPlugin = require('copy-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  configureWebpack: {
    output: {
      sourcePrefix: '',
    },
    // amd: {
    //   toUrlUndefined: true,
    // },
    node: {
      // Resolve node module use of fs
      fs: 'empty',
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': path.resolve(__dirname, 'src'),
        cesium: path.resolve(__dirname, cesiumSource),
      },
    },
    plugins: [
      new CopywebpackPlugin(
        [
          { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' },
          { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
          { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
          { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
        ],
      ),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify('/'),
      }),
    ],
    // module: {
    //   unknownContextCritical: false,
    // },
  },
};
