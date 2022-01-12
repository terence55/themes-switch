const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ThemesGeneratorPlugin = require('../../src/ThemesGeneratorPlugin');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    // filename: 'static/js/[name]-[contenthash].js',
    // chunkFilename: 'static/js/[name]-[contenthash].js',
    filename: '[name]-[contenthash].js',
    chunkFilename: '[name]-[contenthash].js',
    path: `${__dirname}/build`,
    publicPath: ''
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: `${__dirname}/src`
      },
      {
        test: /\.(less|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: 'index.html'
    }),
    new ThemesGeneratorPlugin({
      srcDir: 'src',
      themesDir: 'src/assets/themes',
      outputDir: 'static/css',
      defaultStyleName: 'default.less',
      clearTemp: false,
      enableHotReload: true
    })
  ]
};
