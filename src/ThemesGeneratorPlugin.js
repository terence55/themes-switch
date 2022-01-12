const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const EntryPlugin = require('webpack/lib/SingleEntryPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MiniCssExtractPluginOptions = require('mini-css-extract-plugin/dist/plugin-options.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { collectFiles, randomNum, recursiveIssuer } = require('./utils');

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
    const { clearTemp = true, disable, srcDir, themesDir, outputDir, enableHotReload = false } = this.options;
    if (disable) {
      return;
    }
    if (!srcDir) {
      console.log('themes-switch will not work, srcDir can not be empty');
      return;
    }
    if (!themesDir) {
      console.log('themes-switch will not work, themesDir can not be empty');
      return;
    }
    if (!outputDir) {
      console.log('themes-switch will not work, outputDir can not be empty');
      return;
    }
    ThemesGeneratorPlugin.clearTemp();
    console.log('Themes generating started...');
    const themeList = this.getThemes();
    hookThemesOptions({ compiler, themeList, outputDir });
    hookOnBeforeRun({ compiler, themeList });
    const shouldUseProcessAssets = typeof compiler.webpack !== 'undefined' && typeof compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL !== 'undefined';
    if (!shouldUseProcessAssets) {
      hookOnEmit({ compiler, themeList });
    } else {
      compiler.hooks.thisCompilation.tap(pluginInfo, (compilation) => {
        if (shouldUseProcessAssets) {
          hookOnProcessAssets({ compiler, themeList, compilation });
        }
      });
    }
    if (!enableHotReload || !process.env.WEBPACK_DEV_SERVER) {
      this.generateThemes(themeList);
    } else {
      compiler.hooks.watchRun.tap(pluginInfo, (comp) => {
        const changedTimes = comp.watchFileSystem.watcher.mtimes;
        if (Object.keys(changedTimes).length > 0) {
          const filename = Object.keys(changedTimes)[0]; // eslint-disable-line prefer-destructuring
          if (filename && filename.startsWith(TEMP_THEMES_DIR)) {
            return;
          }
        }
        this.generateThemes(themeList);
      });
    }
    const onDone = () => {
      ThemesGeneratorPlugin.clearTemp();
    };
    if (clearTemp) {
      compiler.hooks.done.tap(pluginInfo, onDone);
    }
  }

  getThemes() {
    const { useStaticThemeName } = this.options;
    const themeFileNames = this.collectOrgThemeFiles();
    const themeList = [];
    themeFileNames.forEach((fileName) => {
      const index = fileName.lastIndexOf('.');
      const key = index > -1 ? fileName.substring(0, index) : fileName;
      themeList.push({
        key: `theme-${key}`,
        path: path.resolve(TEMP_THEMES_DIR, fileName),
        outputName: useStaticThemeName ? `theme-${key}.css` : `theme-${key}-${randomNum(10000000, 99999999)}.css`,
        orgFile: fileName
      });
    });
    return themeList;
  }

  collectOrgThemeFiles() {
    const { themesDir, defaultStyleName, ignoredFilesInThemesDir = [] } = this.options;
    const defaultStyle = defaultStyleName || DEFAULT_STYLE_NAME;
    const ignoredList = DEFAULT_INGORED_LIST.concat(ignoredFilesInThemesDir);
    const orgFiles = fs.readdirSync(themesDir);
    if (!orgFiles || orgFiles.length === 0) {
      console.warn('No themes found');
      return [];
    }
    return orgFiles.filter(file => defaultStyle !== file && ignoredList.indexOf(file) < 0);
  }

  generateThemes(themeList) {
    const { srcDir, themesDir, defaultStyleName, usePureCSS = false } = this.options;
    const defaultStyle = defaultStyleName || DEFAULT_STYLE_NAME;
    ThemesGeneratorPlugin.clearTemp();
    fs.ensureDirSync(TEMP_THEMES_DIR);
    const themesDependencies = [];
    if (usePureCSS) {
      themeList.forEach((theme) => {
        const fileContent = fs.readFileSync(path.join(themesDir, theme.orgFile)).toString();
        fs.writeFileSync(path.join(TEMP_THEMES_DIR, theme.orgFile), fileContent);
      });
      return;
    }
    const importPattern = new RegExp(`@import (.+)${defaultStyle}(.+)`);
    collectFiles(srcDir, themesDependencies, (file) => {
      const fileContent = fs.readFileSync(file).toString();
      return importPattern.test(fileContent);
    });
    if (themesDependencies.length < 1) {
      console.warn('No theme files are used');
      return;
    }
    let importContent = '';
    themesDependencies.forEach((d) => {
      const newFile = path.join(TEMP_THEMES_DIR, d);
      fs.ensureFileSync(newFile);
      fs.copyFileSync(path.join(process.cwd(), d), newFile);
      const fileContent = fs.readFileSync(newFile).toString();
      const newContent = fileContent.replace(importPattern, '');
      fs.writeFileSync(newFile, newContent);
      importContent += `@import '${path.posix.join('./', d)}';\n`;
    });
    themeList.forEach((theme) => {
      const fileContent = fs.readFileSync(path.join(themesDir, theme.orgFile)).toString();
      fs.writeFileSync(path.join(TEMP_THEMES_DIR, theme.orgFile), importAfterVariables(theme.orgFile) ? `${fileContent}\n${importContent}` : `${importContent}${fileContent}`);
    });
  }

  static clearTemp() {
    fs.removeSync(TEMP_DIR);
  }
}

function hookThemesOptions({ compiler, themeList, outputDir }) {
  const onEntryOption = (context) => {
    const themesUrl = {};
    const themesFilename = {};
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
          context,
          theme.path,
          theme.key
        );
        entryPlugin.apply(compiler);
        compiler.options.optimization.splitChunks.cacheGroups[theme.key] = {
          test: (m, c, entry = theme.key) => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
          chunks: 'all',
          enforce: true
        };
        let finalOutputDir = outputDir || DEFAULT_THEME_OUTPUT_DIR;
        finalOutputDir = finalOutputDir.endsWith('/') ? finalOutputDir : `${finalOutputDir}/`;
        themesFilename[theme.key] = `${finalOutputDir}${theme.outputName}`;
        if (publicPath === '') {
          themesUrl[theme.key] = `${finalOutputDir}${theme.outputName}`;
        } else {
          themesUrl[theme.key] = `${publicPath.endsWith('/') ? publicPath : `${publicPath}/`}${finalOutputDir}${theme.outputName}`;
        }
      });
    }

    const definePlugin = new webpack.DefinePlugin({
      process: {
        themes: JSON.stringify(themesUrl)
      }
    });
    definePlugin.apply(compiler);

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
      if (themesFilename[name]) {
        return themesFilename[name];
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
      miniCssExtractPlugin.apply(compiler);
    }
  };
  compiler.hooks.entryOption.tap(pluginInfo, onEntryOption);
}

function hookOnBeforeRun({ compiler, themeList }) {
  const onBeforeRun = (c) => {
    if (!c.options.plugins && c.options.plugins.length < 1) {
      return;
    }
    const excludeThemeChunks = themeList.map(theme => theme.key);
    c.options.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        if (plugin.options.excludeChunks) {
          plugin.options.excludeChunks = [...excludeThemeChunks, ...plugin.options.excludeChunks];
        } else {
          plugin.options.excludeChunks = excludeThemeChunks;
        }
      }
    });
  };
  compiler.hooks.beforeRun.tap(pluginInfo, onBeforeRun);
}

function hookOnEmit({ compiler, themeList }) {
  const onEmit = (compilation, callback) => {
    const stats = compilation.getStats().toJson();
    if (themeList && themeList.length > 0) {
      themeList.forEach((theme) => {
        const outputByThemes = stats.assetsByChunkName[theme.key];
        const pattern = getUnusedFilePattern({ key: theme.key, compiler });
        if (outputByThemes) {
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
  compiler.hooks.emit.tapAsync(pluginInfo, onEmit);
}

function hookOnProcessAssets({ compiler, themeList, compilation }) {
  const onProcessAssets = (assets) => {
    const keys = Object.keys(assets);
    if (themeList && themeList.length > 0) {
      themeList.forEach((theme) => {
        const pattern = getUnusedFilePattern({ key: theme.key, compiler });
        keys.forEach((key) => {
          if (pattern.test(key)) {
            compilation.deleteAsset(key);
          }
        });
      });
    }
  };
  compilation.hooks.processAssets.tap(
    {
      name: pluginInfo.name,
      stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
    }, onProcessAssets);
}

function getUnusedFilePattern({ key, compiler }) {
  const outputFilename = compiler.options.output && compiler.options.output.filename ? compiler.options.output.filename : '';
  const outputDir = outputFilename.substring(0, outputFilename.lastIndexOf('/'));
  if (!outputDir) {
    return new RegExp(`^${key}(.*).js`);
  }
  return new RegExp(`^${outputDir}/${key}(.*).js`);
}

function importAfterVariables(file) {
  return file.lastIndexOf('.scss') === file.length - 5 || file.lastIndexOf('.sass') === file.length - 5;
}

module.exports = ThemesGeneratorPlugin;
