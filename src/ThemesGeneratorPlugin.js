const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const sast = require('sast');
const EntryPlugin = require('webpack/lib/SingleEntryPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MiniCssExtractPluginOptions = require('mini-css-extract-plugin/dist/plugin-options.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { collectFiles, randomNum, recursiveIssuer, simplifyCss } = require('./utils');

const DEFAULT_INGORED_LIST = ['.DS_Store', '.git'];
const TEMP_DIR = path.resolve(process.cwd(), 'temp');
const TEMP_THEMES_DIR_NAME = 'themes';
const TEMP_THEMES_DIR = path.resolve(TEMP_DIR, TEMP_THEMES_DIR_NAME);
const DEFAULT_STYLE_NAME = 'default';
const pluginInfo = { name: 'ThemesGeneratorPlugin' };
const DEFAULT_THEME_OUTPUT_DIR = 'static/theme/';
const DEFAULT_CSS_OUTPUT_NAME = '[name]-[contenthash].css';

class ThemesGeneratorPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { clearTemp = true, disable, srcDir, themesDir, outputDir } = this.options;
    if (disable) {
      return;
    }
    if (!srcDir) {
      console.log('srcDir can not be empty');
      return;
    }
    if (!themesDir) {
      console.log('themesDir can not be empty');
      return;
    }
    if (!outputDir) {
      console.log('outputDir can not be empty');
      return;
    }
    const themeList = this.getThemeList();
    const webpackNewVer = 'hooks' in compiler;
    const onEntryOption = (context) => {
      if (typeof compiler.options.entry !== 'object') {
        console.log('Entry must be an object if ThemesGeneratorPlugin was used!');
        return;
      }
      console.log('Themes generating started...');

      const finalThemes = {};
      const publicPath = compiler.options.output && compiler.options.output.publicPath ? compiler.options.output.publicPath : '';

      if (themeList && themeList.length > 0) {
        if (!compiler.options.optimization) {
          compiler.options.optimization = {};
        }
        if (!compiler.options.optimization.splitChunks) {
          compiler.options.optimization.splitChunks = {};
        }
        if (!compiler.options.optimization.splitChunks.cacheGroups) {
          compiler.options.optimization.splitChunks.cacheGroups = {};
        }

        themeList.forEach((theme) => {
          const entryPlugin = new EntryPlugin(
            this.context || context,
            theme.path,
            theme.key
          );
          if (webpackNewVer) {
            entryPlugin.apply(compiler);
          } else {
            compiler.apply(entryPlugin);
          }

          compiler.options.optimization.splitChunks.cacheGroups[theme.key] = {
            test: (m, c, entry = theme.key) => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
            chunks: 'all',
            enforce: true
          };

          let finalOutputDir = outputDir || DEFAULT_THEME_OUTPUT_DIR;
          finalOutputDir = finalOutputDir.endsWith('/') ? finalOutputDir : `${finalOutputDir}/`;
          finalThemes[theme.key] = publicPath ? `${publicPath}${publicPath.endsWith('/') ? '' : '/'}${finalOutputDir}${theme.outputName}` : `${finalOutputDir}${theme.outputName}`;
        });
      }

      const definePlugin = new webpack.DefinePlugin({
        process: {
          themes: JSON.stringify(finalThemes)
        }
      });
      if (webpackNewVer) {
        definePlugin.apply(compiler);
      } else {
        compiler.apply(definePlugin);
      }

      let orgMiniCssExtractPlugin;
      let orgFilename;
      if (compiler.options.plugins && compiler.options.plugins.length > 0) {
        compiler.options.plugins.forEach((plugin) => {
          if (plugin instanceof MiniCssExtractPlugin) {
            orgMiniCssExtractPlugin = plugin;
          }
        });
      }
      const isMiniCssOldVer = typeof MiniCssExtractPluginOptions.properties.moduleFilename !== 'undefined';
      const filenameField = isMiniCssOldVer ? 'moduleFilename' : 'filename';
      if (orgMiniCssExtractPlugin) {
        orgFilename = orgMiniCssExtractPlugin.options[filenameField];
      }
      const moduleFilenameFunc = (pathData) => {
        const name = isMiniCssOldVer ? pathData.name : pathData.chunk.name;
        if (finalThemes[name]) {
          return `${finalThemes[name]}`;
        }
        let fileName = DEFAULT_CSS_OUTPUT_NAME;
        if (orgMiniCssExtractPlugin && orgFilename) {
          if (typeof orgFilename !== 'function') {
            fileName = orgFilename;
          } else {
            fileName = orgFilename(pathData);
          }
        }
        return fileName;
      };
      if (orgMiniCssExtractPlugin) {
        orgMiniCssExtractPlugin.options[filenameField] = moduleFilenameFunc;
      } else {
        const miniCssExtractPlugin = new MiniCssExtractPlugin({
          [filenameField]: moduleFilenameFunc
        });
        if (webpackNewVer) {
          miniCssExtractPlugin.apply(compiler);
        } else {
          compiler.apply(miniCssExtractPlugin);
        }
      }

      if (compiler.options.plugins && compiler.options.plugins.length > 0) {
        const excludeThemeChunks = themeList.map(theme => theme.key);
        compiler.options.plugins.forEach((plugin) => {
          if (plugin instanceof HtmlWebpackPlugin) {
            if (plugin.options.excludeChunks) {
              plugin.options.excludeChunks = [...excludeThemeChunks, ...plugin.options.excludeChunks];
            } else {
              plugin.options.excludeChunks = excludeThemeChunks;
            }
          }
        });
      }
    };
    const onEmit = (compilation, callback) => {
      const stats = compilation.getStats().toJson();
      if (themeList && themeList.length > 0) {
        themeList.forEach((theme) => {
          const outputByThemes = stats.assetsByChunkName[theme.key];
          if (outputByThemes) {
            const pattern = new RegExp(`^${theme.key}(.*).(js|css)`);
            if (Array.isArray(outputByThemes)) {
              outputByThemes.forEach((fileName) => {
                if (pattern.test(fileName) && compilation.assets[fileName]) {
                  delete compilation.assets[fileName];
                }
              });
            } else if (typeof outputByThemes === 'string') {
              if (pattern.test(outputByThemes) && compilation.assets[outputByThemes]) {
                delete compilation.assets[outputByThemes];
              }
            }
          }
        });
      }
      if (callback && typeof callback === 'function') {
        callback();
      }
    };
    const onDone = () => {
      fs.removeSync(TEMP_DIR);
    };
    if (webpackNewVer) {
      compiler.hooks.entryOption.tap(pluginInfo, onEntryOption);
      compiler.hooks.emit.tapAsync(pluginInfo, onEmit);
      if (clearTemp) {
        compiler.hooks.done.tap(pluginInfo, onDone);
      }
    } else {
      compiler.plugin('entry-option', onEntryOption);
      compiler.plugin('emit', onEmit);
      if (clearTemp) {
        compiler.plugin('done', onDone);
      }
    }
  }

  getThemeList() {
    const { useStaticThemeName } = this.options;
    const themeFileNames = this.generateThemes();
    const themeList = [];
    themeFileNames.forEach((fileName) => {
      const index = fileName.lastIndexOf('.');
      const key = index > -1 ? fileName.substr(0, index) : fileName;
      themeList.push({
        key: `theme-${key}`,
        path: path.resolve(TEMP_THEMES_DIR, fileName),
        outputName: useStaticThemeName ? `theme-${key}.css` : `theme-${key}-${randomNum(10000000, 99999999)}.css`
      });
    });
    return themeList;
  }

  generateThemes() {
    const { srcDir, themesDir, defaultStyleName, ignoredFilesInThemesDir = [], usePureCSS = false } = this.options;
    const ignoredList = DEFAULT_INGORED_LIST.concat(ignoredFilesInThemesDir);
    fs.removeSync(TEMP_DIR);
    const orgFiles = fs.readdirSync(themesDir);
    if (!orgFiles || orgFiles.length === 0) {
      console.warn('No themes');
      return;
    }
    fs.ensureDirSync(TEMP_THEMES_DIR);
    const themesDependencies = [];
    const defaultStyle = defaultStyleName || DEFAULT_STYLE_NAME;
    const importPattern = new RegExp(`@import (.+)${defaultStyle}(.+)`);
    if (usePureCSS) {
      const themeFileNames = [];
      orgFiles.forEach((file) => {
        if (defaultStyle !== file && ignoredList.indexOf(file) < 0) {
          themeFileNames.push(file);
          const fileContent = fs.readFileSync(path.join(themesDir, file)).toString();
          fs.writeFileSync(path.join(TEMP_THEMES_DIR, file), fileContent);
        }
      });
      return themeFileNames;
    }
    collectFiles(srcDir, themesDependencies, (file) => {
      const fileContent = fs.readFileSync(file).toString();
      return importPattern.test(fileContent);
    });
    if (themesDependencies.length < 1) {
      return [];
    }
    let importContent = '';
    themesDependencies.forEach((d) => {
      const newFile = path.join(TEMP_THEMES_DIR, d);
      fs.ensureFileSync(newFile);
      fs.copyFileSync(path.join(process.cwd(), d), newFile);
      const fileContent = fs.readFileSync(newFile).toString();
      const astTree = sast.parse(fileContent, { syntax: path.extname(newFile).replace('.', '') });
      simplifyCss(astTree);
      const newContent = sast.jsonify(astTree).replace(/\$/g, '@');
      fs.writeFileSync(newFile, newContent.replace(importPattern, ''));
      importContent += `@import '${path.posix.join('./', d)}';\n`;
    });
    const themeFileNames = [];
    orgFiles.forEach((file) => {
      if (defaultStyle !== file && ignoredList.indexOf(file) < 0) {
        themeFileNames.push(file);
        const fileContent = fs.readFileSync(path.join(themesDir, file)).toString();
        fs.writeFileSync(path.join(TEMP_THEMES_DIR, file), ThemesGeneratorPlugin.importAfterVariables(file) ? `${fileContent}\n${importContent}` : `${importContent}${fileContent}`);
      }
    });
    return themeFileNames;
  }

  static importAfterVariables(file) {
    return file.lastIndexOf('.scss') === file.length - 5 || file.lastIndexOf('.sass') === file.length - 5;
  }

  static clearTemp() {
    fs.removeSync(TEMP_DIR);
  }
}

module.exports = ThemesGeneratorPlugin;
