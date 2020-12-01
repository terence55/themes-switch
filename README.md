# themes-switch

## Features

- Multiple themes supported via custom variables.
- Generating themes via `webpack`.
- Themes switch without page reload.
- Supported formats: `css`, `less`, `postcss`, `sass`.

## Changes
In the new version `themes-switch` replaces `extract-text-webpack-plugin` with `mini-css-extract-plugin`, and upgrade peerDependency to Webpack 4.3.x. Now the option `themesLoader` is deprecated.
If you are using Webpack 3.x and `extract-text-webpack-plugin`, [view the docs here](https://github.com/terence55/themes-switch/blob/master/README_webpack_v3.md).

`importAfterVariables` has been removed, and the plugin will automatically recognize this.
`ignoredFilesInThemesDir` is a new option to ignore files in the theme directory.
`usePureCSS` is a new option to declare whether to use pure CSS only.

## Installation

```bash
npm install themes-switch --save
```
    
## Usage

- Config `themes-switch` in `webpack.config.js`, and put `MiniCssExtractPlugin.loader` in your less/sass/postcss/css loaders.

```js
const ThemesGeneratorPlugin = require('themes-switch/ThemesGeneratorPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
      {
        test: /\.(less|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
      }
    ]
  },
  plugins: [
    new ThemesGeneratorPlugin({
      srcDir: 'src',
      themesDir: 'src/assets/themes',
      outputDir: 'static/css',
      defaultStyleName: 'default.less'
    })
  ]
};
```

- Create following directory for themes, and set it to option `themesDir`:

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

Switch themes in your code

```js
import { changeTheme } from 'themes-switch';

// ...
changeTheme('themes-dark', 'css/themes-dark.css');
// ...

```

## Options

| Name | Description | Type | Default Value |
| -------- | ----------- | ---- | ------------- |
| srcDir | Souce code directory | `{String}` | |
| themesDir | Directory of themes | `{String}` | |
| outputDir | Directory of generated files | `{String}` | |
| defaultStyleName | File name of default style, specify it when you use different style formats | `{String}` | `default` |
| clearTemp | Delete temp directory when webpack was done | `{Boolean}` | `true` |
| disable | Disable the plugin | `{Boolean}` | `false` |
| useStaticThemeName | Whether to add random number to file names of themes | `{Boolean}` | `false` |
| ignoredFilesInThemesDir | Files that will be ignored in themes directory | `{String}` | |
| usePureCSS | If you only use pure CSS, you need to explicitly declare | `{Boolean}` | `false` |


## Methods

### changeTheme

- theme: new theme name, such as `theme-dark`.
- themeUrl: new theme url, such as `css/dark.css`. You can get the value from `process.themes`
- onLoad: callback when new link was loaded.

### ThemesGeneratorPlugin.clearTemp

It will delete temp directory. You can call the method as needed, e.g. when you stop webpack-dev-server in development mode.