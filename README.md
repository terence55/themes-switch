# themes-switch

## Features

- Multiple themes supported via custom variables.
- Generating themes via `webpack`.
- Themes switch without page reload.
- Supported formats: `css`, `less`, `postcss`, `sass`.

## For Hot reload
- Hot-reload is supported in v1.1.x, new theme files will be generated when a reload is triggered.
- When hot-reload is enabled, the temp directory will not be cleared if webpack-dev-server was running.
- To improve performance, dynamic addition of new theme files is not supported, please restart the server when adding new files.

## For Webpack v3
- Webpack v3 is no longer supported from v1.1.x, please use v1.0.x instead.
- In the version `v1.0.7` `themes-switch` replaces `extract-text-webpack-plugin` with `mini-css-extract-plugin`, and upgrade peerDependency to Webpack 4.3.x. Now the option `themesLoader` is deprecated.
If you are using Webpack 3.x and `extract-text-webpack-plugin`, [view the docs here](https://github.com/terence55/themes-switch/blob/master/README_webpack_v3.md).

## Installation

```bash
npm install themes-switch --save-dev
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
    filename: '[name]-[contenthash].js',
    chunkFilename: '[name]-[contenthash].js',
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

- Import `default.less` when using theme variables:

```css
@import 'default.less';

.main {
  background: @color-main;
}
```

- `ThemesGeneratorPlugin` scans files in `themesDir` and files that import `default.less`, then generates separated files for all themes automatically.

- You can access the themes info via `process.themes` in your code, value such as `{ 'theme-dark': 'css/dark.css', 'theme-light': 'css/light.css' }`, or call `getThemes` method directly.

```js
import { getThemes } from 'themes-switch';

// ...
const themes = getThemes();
// ...
```

- Call `switchTheme` method to switch to new theme by pass theme name.

Switch themes in your code

```js
import { switchTheme } from 'themes-switch';

// ...
switchTheme({ theme: 'themes-dark' });
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
| enableHotReload | Whether to generate new files for webpack hot reload | `{Boolean}` | `false` |


## Methods

### switchTheme
```js
switchTheme({ theme: 'themes-dark', onLoad: onLoadFunc });
```
Options
- theme: new theme name, such as `theme-dark`.
- onLoad: callback when new link was loaded.

### changeTheme
```js
changeTheme('themes-dark', 'css/dark.css', onLoadFunc);
```
Options
- theme: new theme name, such as `theme-dark`.
- themeUrl: new theme url, such as `css/dark.css`. You can get the value from `process.themes`
- onLoad: callback when new link was loaded.

### getThemes
```js
const themes = getThemes();
// { 'theme-dark': 'css/dark.css', 'theme-light': 'css/light.css' }
```

### ThemesGeneratorPlugin.clearTemp

It will delete temp directory. You can call the method as needed, e.g. when you stop webpack-dev-server in development mode.