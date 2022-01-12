const THEME_KEY = 'theme';
const PLUGIN_KEY = 'pkey';
const PLUGIN_VALUE = 'themes-switch';

const themes = process.themes; // eslint-disable-line prefer-destructuring

function switchTheme({ theme, onLoad }) {
  const themeUrl = themes[theme];
  const container = document.html || document.getElementsByTagName('html')[0];
  const links = container.getElementsByTagName('link');
  let oldTheme;
  if (links && links.length > 0) {
    for (let i = 0; i < links.length; i++) {
      if (getAttribute(links[i], PLUGIN_KEY) === PLUGIN_VALUE) {
        oldTheme = links[i];
        break;
      }
    }
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = themeUrl;
  setAttribute(link, THEME_KEY, theme);
  setAttribute(link, PLUGIN_KEY, PLUGIN_VALUE);
  container.appendChild(link);
  link.onload = () => {
    removeNode(oldTheme);
    if (onLoad) {
      onLoad(link);
    }
  };
}

function getThemes() {
  return themes;
}

function changeTheme(theme, themeUrl, onLoad) {
  switchTheme({ theme, onLoad });
}

function removeNode(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function getAttribute(element, key) {
  if (element.dataset) {
    return element.dataset[key];
  }
  return element.getAttribute(key);
}

function setAttribute(element, key, value) {
  if (element.dataset) {
    element.dataset[key] = value;
  } else {
    element.setAttribute(key, value);
  }
}

module.exports = {
  changeTheme,
  switchTheme,
  getThemes
};
