const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const cesiumSource = './node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const fs = require('fs');

module.exports = {
  publicPath: '/', // process.env.NODE_ENV === 'production' ? '@publicPath@' : '/',
  devServer: {
    port: 7000,
    host: '0.0.0.0',
    https: {
      pfx: fs.readFileSync('./src/assets/certificateDELETE/tlsTemp.p12'),
      passphrase: 'password',
    },
    hotOnly: true,
    disableHostCheck: true,
    proxy: 'https://localhost:7350',
    // proxy: {
    //   '/api': { target: 'http://127.0.0.1:9004' },
    //   '/tiles': { target: 'https://localhost:7344' },
    //   '/geoserver': { target: 'http://localhost:8080' },
    //   '/': { target: 'https://localhost:7350', ws: false },
    // },
  },
  configureWebpack: {
    devtool: 'source-map',
    output: {
      sourcePrefix: '',
    },
    amd: {
      toUrlUndefined: true,
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': path.resolve('src'),
        cesium: path.resolve(__dirname, cesiumSource),
      },
    },
    plugins: [
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, cesiumWorkers), to: 'Cesium/Workers' }]),
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Cesium/Assets' }]),
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Cesium/Widgets' }]),
      // new webpack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify('/') }),
      // new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty/Workers'),
      // to: 'ThirdParty/Workers' }]),
      // new CopyWebpackPlugin([{ from: path.join(staticDic, 'imageData'), to: 'imageData' }]),
      // new CopyWebpackPlugin([{ from: path.join(staticDic, 'model'), to: 'model3D' }]),
      // new webpack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify('./') }),
    ],
    module: {
      unknownContextCritical: false,
      rules: [
        {
          test: /\.proto$/,
          use: {
            loader: 'protobufjs-loader-webpack4',
            options: {
            //   // /* controls the "target" flag to pbjs - true for
            //   //  * json-module, false for static-module.
            //   //  * default: false
            //   //  */
            //   // json: true,
            //
            //   /* import paths provided to pbjs.
            //    * default: webpack import paths (i.e. config.resolve.modules)
            //    */
            //   // paths: ['/path/to/definitions'],
            //
            //   /* additional command line arguments passed to
            //    * pbjs, see https://github.com/dcodeIO/ProtoBuf.js/#pbjs-for-javascript
            //    * for a list of what's available.
            //    * default: []
            //    */
            //   // pbjsArgs: ['--no-encode']
            },
          },
        },
      ],
    },
    // module: {
    //   // unknownContextCritical: /^.\/.*$/,
    //   // unknownContextCritical: false,
    //   rules: [{
    //     test: /\.gltf$/,
    //     use: [{
    //       loader: 'file-loader',
    //       options: {},
    //     }],
    //   }],
    //
    // },
  },
};
