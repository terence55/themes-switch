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
    loader: require.resolve('postcss-loader'),
    options: {
      plugins: () => [
        require('postcss-import'),
        require('postcss-cssnext')({
          browsers: ['last 2 versions', '> 5%']
        }),
        require('postcss-flexbugs-fixes')
      ]
    }
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
        test: /\.css$/,
        loader: extractNormal.extract({
          use: loaders
        })
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
      defaultStyleName: 'default.css',
      themesLoader: {
        test: /\.css$/,
        loaders
      }
    })
  ]
};
