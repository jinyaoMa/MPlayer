const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const package = require('../package.json');

module.exports = {
  mode: 'production',

  bail: true,

  devtool: 'source-map',

  entry: {
    MPlayer: './src/js/main.js'
  },

  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name].min.js',
    library: '[name]',
    libraryTarget: 'umd',
    libraryExport: 'default',
    umdNamedDefine: true,
    publicPath: '/',
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.styl'],
  },

  module: {
    strictExportPresence: true,
    rules: [{
      test: /\.js$/,
      use: [
        'template-string-optimize-loader',
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env']
          }
        }
      ]
    }, {
      test: /\.styl$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            plugins: [autoprefixer, cssnano]
          }
        },
        'stylus-loader'
      ]
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader',
      options: {
        limit: 40000,
      }
    }, {
      test: /\.svg$/,
      loader: 'svg-inline-loader'
    }, {
      test: /\.ejs$/,
      loader: 'ejs-loader'
    }]
  },

  plugins: [
    new webpack.DefinePlugin({
      MPLAYER_ALIAS: `"${package.alias}"`,
      MPLAYER_VERSION: `"${package.version}"`,
      MPLAYER_AUTHOR: `"${package.author}"`
    }),
    new webpack.ProvidePlugin({
      _: "underscore"
    })
  ],

  performance: {
    hints: false,
  }
};