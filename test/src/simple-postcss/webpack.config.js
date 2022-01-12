const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ThemesGeneratorPlugin = require('../../../src/ThemesGeneratorPlugin');

let PostcssLoaderOptions;
try {
  PostcssLoaderOptions = require('postcss-loader/dist/options.json');
} catch (e) {
  console.log('options.json not found in dist');
  PostcssLoaderOptions = require('postcss-loader/src/options.json');
}

const isPostcssLoaderNewVer = typeof PostcssLoaderOptions.properties.postcssOptions !== 'undefined';

const cssLoaderOptions = {};
if (isPostcssLoaderNewVer) {
  cssLoaderOptions.postcssOptions = {
    plugins: [
      'postcss-import',
      'postcss-flexbugs-fixes',
      ['postcss-preset-env',
      {
        stage: 4,
        features: {
          'custom-properties': {
            preserve: false
          }
        }
      }]
    ]
  };
} else {
  cssLoaderOptions.plugins = [
    require('postcss-import'),
    require('postcss-cssnext')({
      browsers: ['last 2 versions', '> 5%']
    }),
    require('postcss-flexbugs-fixes')

  ];
}

const loaders = [
  {
    loader: require.resolve('css-loader')
  },
  {
    loader: require.resolve('postcss-loader'),
    options: cssLoaderOptions
  }
];

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
        test: /\.js$/,
        use: ['babel-loader'],
        include: `${__dirname}/src`
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, ...loaders]
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
      defaultStyleName: 'default.css',
      useStaticThemeName: true
    })
  ]
};
