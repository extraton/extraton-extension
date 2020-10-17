const CopyPlugin = require('copy-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          {from: './node_modules/ton-client-web-js/tonclient.wasm'}
        ],
      }),
      new RemovePlugin({
        after: {
          include: [
            './dist/injection.html'
          ]
        }
      }),
    ],
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js',
    },
  },
  chainWebpack: config => {
    if (config.plugins.has('extract-css')) {
      const extractCSSPlugin = config.plugin('extract-css');
      extractCSSPlugin && extractCSSPlugin.tap(() => [{
        filename: 'css/[name].css',
        chunkFilename: 'css/[name].css',
      }])
    }
    config.optimization.delete('splitChunks');
  },
  pages: {
    index: {
      template: 'public/index.html',
      entry: './src/main.js',
      // chunks: ['index']
    },
    injection: {
      entry: './src/injection.js',
      // chunks: ['injection']
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/event-page.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-script.js'
            ]
          }
        }
      }
    }
  }
}
