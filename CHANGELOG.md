# Changelog


## 1.1.0

`2022-08-10`

- Support Webpack v5
- Support hot-reload, add new option `enableHotReload`
- Remove compatibility code for Webpack v3

⚠ BREAKING CHANGES
- Webpack v3 is no longer supported, please use 1.0.x instead.


## 1.0.11

`2021-01-04`

- Fix the compatibility problem when using MiniCssExtractPlugin v1.x


## 1.0.9

`2020-12-01`

- Support to configure ignore files in the theme directory, add new option `ignoredFilesInThemesDir`
- No longer need to manually configure the import order, remove option `importAfterVariables`
- Add new option `usePureCSS` to clearly identify whether to use `postcss` or `pure css`


## 1.0.8

`2019-11-18`

- Fix the problem of context and public path when setting style entry


## 1.0.7

`2019-11-12`

- Update the peer dependent Webpack version to >= 4.3.x
- Replace `extract-text-webpack-plugin` with `mini-css-extract-plugin` for Webpack v4
- Remove option `themesLoader`
- No longer need to remove old theme manually when switching themes
- The existing MiniCssExtractPlugin configuration will be reused


## 1.0.6

`2019-05-05`

- Fix the problem when using rules.resource


## 1.0.5

`2018-07-19`

- Support Webpack v4
- Fix the problem when switching themes in IE
