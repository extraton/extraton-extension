const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: './node_modules/ton-client-web-js/tonclient.wasm' }
        ],
      }),
    ],
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background.js"
        },
        contentScripts: {
          entries: {
            "content-script": ["src/content-scripts/content-script.js"]
          }
        }
      }
    }
  }
}