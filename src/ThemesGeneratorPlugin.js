const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const EntryPlugin = require('webpack/lib/SingleEntryPlugin');
const { collectFiles, randomNum, getThemeName } = require('./utils');

const TEMP_DIR = path.resolve(process.cwd(), 'temp');
const TEMP_THEMES_DIR_NAME = 'themes';
const TEMP_THEMES_DIR = path.resolve(TEMP_DIR, TEMP_THEMES_DIR_NAME);
const TEMP_THEME_NAME = 'tempthemes';
const TEMP_THEME_JS = `${TEMP_THEME_NAME}.js`;
const DEFAULT_STYLE_NAME = 'default';

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
    const { themesPaths, finalThemes, extractPlugins, themeLoaders } = this.generateExtraOptions();
    compiler.plugin('entry-option', () => {
      if (typeof compiler.options.entry !== 'object') {
        console.log('Entry must be an object if ThemesGeneratorPlugin was used!');
        return;
      }
      console.log('Themes generating started...');

      compiler.apply(new EntryPlugin(
        this.context,
        path.join(TEMP_DIR, TEMP_THEME_JS),
        TEMP_THEME_NAME
      ));

      extractPlugins.forEach(plugin => compiler.apply(plugin));

      compiler.apply(new webpack.DefinePlugin({
        process: {
          themes: JSON.stringify(finalThemes)
        }
      }));

      if (!compiler.options.module.rules) {
        compiler.options.module.rules = [];
      }
      compiler.options.module.rules.forEach(((rule) => {
        if (!rule.exclude) {
          rule.exclude = themesPaths;
        } else if (Array.isArray(rule.exclude)) {
          rule.exclude = rule.exclude.concat(themesPaths);
        } else {
          rule.exclude = [rule.exclude, ...themesPaths];
        }
      }));
      compiler.options.module.rules = compiler.options.module.rules.concat(themeLoaders);
    });

    compiler.plugin('emit', (compilation, callback) => {
      const stats = compilation.getStats().toJson();
      const outputByThemes = stats.assetsByChunkName[TEMP_THEME_NAME];
      if (outputByThemes) {
        const pattern = new RegExp(`^${TEMP_THEME_NAME}(.*).(js|css)`);
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
      callback();
    });

    if (clearTemp) {
      compiler.plugin('done', () => {
        fs.removeSync(TEMP_DIR);
      });
    }
  }

  generateExtraOptions() {
    const { outputDir, themesLoader, defaultStyleName, useStaticThemeName } = this.options;
    this.generateThemes();
    const ignoredFiles = [defaultStyleName || DEFAULT_STYLE_NAME];
    const themeFileNames = fs.readdirSync(TEMP_THEMES_DIR).filter(file => ignoredFiles.indexOf(file) < 0);
    const themesPaths = themeFileNames.map(fileName => path.resolve(TEMP_THEMES_DIR, fileName));
    const finalThemes = {};
    themeFileNames.forEach((fileName) => {
      const key = getThemeName(fileName);
      finalThemes[key] = `${outputDir}/${key}${useStaticThemeName ? '' : `-${randomNum(10000000, 99999999)}`}.css`;
    });
    const extractPlugins = themeFileNames.map(fileName => new ExtractTextPlugin({ filename: () => {
      const key = getThemeName(fileName);
      return finalThemes[key] || `${outputDir}/${key}.css`;
    } }));
    const themeLoaders = themeFileNames.map((fileName, index) => {
      return {
        test: themesLoader.test,
        include: path.resolve(TEMP_THEMES_DIR, fileName),
        loader: extractPlugins[index].extract({
          use: themesLoader.loaders
        })
      };
    });
    return {
      themesPaths,
      finalThemes,
      extractPlugins,
      themeLoaders
    };
  }

  generateThemes() {
    const { srcDir, themesDir, defaultStyleName, importAfterVariables } = this.options;
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
    collectFiles(srcDir, themesDependencies, (file) => {
      const fileContent = fs.readFileSync(file).toString();
      return importPattern.test(fileContent);
    });
    let importThemesContent = '';
    if (!themesDependencies || themesDependencies.length < 1) {
      orgFiles.forEach((file) => {
        importThemesContent += `import './${TEMP_THEMES_DIR_NAME}/${file}';\n`;
        fs.copyFileSync(path.join(process.cwd(), themesDir, file), path.join(TEMP_THEMES_DIR, file));
      });
      fs.writeFileSync(path.join(TEMP_DIR, TEMP_THEME_JS), importThemesContent);
      return;
    }
    let importContent = '';
    themesDependencies.forEach(d => (importContent += `@import '../../${d}';\n`));
    orgFiles.forEach((file) => {
      const fileContent = fs.readFileSync(path.join(themesDir, file)).toString();
      fs.writeFileSync(path.join(TEMP_THEMES_DIR, file), importAfterVariables ? `${fileContent}\n${importContent}` : `${importContent}${fileContent}`);
      importThemesContent += `import './${TEMP_THEMES_DIR_NAME}/${file}';\n`;
    });
    fs.writeFileSync(path.join(TEMP_DIR, TEMP_THEME_JS), importThemesContent);
  }

  static clearTemp() {
    fs.removeSync(TEMP_DIR);
  }
}

module.exports = ThemesGeneratorPlugin;
