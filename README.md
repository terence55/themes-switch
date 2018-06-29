# themes-switch

## Features

- Multiple themes supported via custom variables.
- Generating themes via `webpack`.
- Themes switch without page reload.
- Supported formats: `css`, `less`, `postcss`, `sass`.

## Installation

```bash
npm install themes-switch --save
```
    
## Usage

```js
const ThemesGeneratorPlugin = require('themes-switch/ThemesGeneratorPlugin');

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
      // ...
    ]
  },
  plugins: [
    new ThemesGeneratorPlugin({
      srcDir: 'src',
      themesDir: 'src/assets/themes',
      outputDir: 'static/css',
      defaultStyleName: 'default.less',
      themesLoader: {
        test: /\.(less|css)$/,
        loaders: [
          { loader: require.resolve('css-loader') },
          { loader: require.resolve('less-loader') }
        ]
      }
    })
  ]
};
```

- Create directory for themes, and set it to option `themesDir`:

```
src
  - themes
    - dark.less
    - default.less
    - light.less
```

- Import your default theme into `default.less`:

```css
@import 'light.less';
```

- Specify theme variables:

```css
@color-main: #222A42;
@color-text: #FFF;
```

> When you use sass, you should add default flag to default theme variables, such as `$color-main: #0A6EFA !default;`.

- Import `default.less` when you use theme variables:

```css
@import 'default.less';

.main {
  background: @color-main;
}
```

- `ThemesGeneratorPlugin` scans files in `themesDir` and files that import `default.less`, then generates separated files for all themes automatically.

- You can access the themes info via `process.themes` in your code, value such as `{ 'theme-dark': 'css/dark.css', 'theme-light': 'css/light.css' }`.

- Call `changeTheme` method to switch to new theme by pass theme name and url.

## Options

| Name | Description | Type | Default Value |
| -------- | ----------- | ---- | ------------- |
| srcDir | Souce code directory | `{String}` | |
| themesDir | Directory of themes | `{String}` | |
| outputDir | Directory of generated files | `{String}` | |
| defaultStyleName | File name of default style, specify it when you use different style formats | `{String}` | `default` |
| clearTemp | Delete temp directory when webpack was done | `{Boolean}` | `true` |
| importAfterVariables | Specify order of imported files and theme variables. It should be set to `true` when you use `sass` | `{Boolean}` | `false` |
| themesLoader | Loaders for generating themes, such as `{ test: /\.css$/, 'loaders': [ { loader: require.resolve('css-loader') } ] }` | `{Object}` | |
| disable | Disable the plugin | `{Boolean}` | `false` |
| useStaticThemeName | Whether to add random number to file names of themes | `{Boolean}` | `false` |

## Methods

### changeTheme

- theme: new theme name, such as `theme-dark`.
- themeUrl: new theme url, such as `css/dark.css`. You can get the value from `process.themes`
- currentLink: current link element that would be removed when new element had been loaded.
- onLoad: callback when new link was loaded.

### removeTheme

- link: link element that would be removed.

### ThemesGeneratorPlugin.clearTemp

It will delete temp directory. You can call the method as needed, e.g. when you stop webpack-dev-server in development mode.