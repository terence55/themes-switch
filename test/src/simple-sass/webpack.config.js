const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ThemesGeneratorPlugin = require('../../../src/ThemesGeneratorPlugin');

module.exports = {
  entry: {
    main: './src/main.js'
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: `${__dirname}/build`,
    publicPath: ''
  },
  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
        loader: [MiniCssExtractPlugin.loader, 'css-loader',
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              outputStyle: 'expanded'
            }
          }
        }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new ThemesGeneratorPlugin({
      srcDir: 'src',
      themesDir: 'src/assets/themes',
      outputDir: 'static/css',
      defaultStyleName: 'default.scss',
      importAfterVariables: true,
      useStaticThemeName: true
    })
  ]
};
