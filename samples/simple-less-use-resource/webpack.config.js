const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ThemesGeneratorPlugin = require('../../src/ThemesGeneratorPlugin');

const cssFilename = '[name].[hash:8].css';
const extractNormal = new ExtractTextPlugin(cssFilename);

const loaders = [
  {
    loader: require.resolve('css-loader')
  },
  {
    loader: require.resolve('less-loader')
  }
];

module.exports = {
  entry: {
    main: './src/main.js'
  },
  output: {
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[hash].js',
    path: `${__dirname}/build`,
    publicPath: ''
  },
  module: {
    rules: [
      {
        loader: extractNormal.extract({
          use: loaders
        }),
        resource: {
          test: /\.(less|css)$/,
          exclude: []
        }
      }
    ]
  },
  plugins: [
    extractNormal,
    new HtmlWebpackPlugin({
      inject: true,
      template: 'index.html',
      excludeChunks: ['tempthemes']
    }),
    new ThemesGeneratorPlugin({
      srcDir: 'src',
      themesDir: 'src/assets/themes',
      outputDir: 'static/css',
      defaultStyleName: 'default.less',
      themesLoader: {
        test: /\.(less|css)$/,
        loaders
      }
    })
  ]
};
