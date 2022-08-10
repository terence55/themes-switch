const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { clearTemp } = require('../../src/ThemesGeneratorPlugin');
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
    publicPath: '/build'
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
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 100,
          name: '/static/media/[name].[hash:8].[ext]'
        }
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
      enableHotReload: true,
      clearTemp: false
    })
  ]
};
