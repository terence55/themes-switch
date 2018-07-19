function changeTheme(theme, themeUrl, currentLink, onLoad) {
  if (currentLink) {
    const currentLinkDataset = currentLink.dataset || currentLink.getAttribute('data-theme');
    if (theme === currentLinkDataset.theme) {
      return;
    }
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = themeUrl;
  if (link.dataset) {
    link.dataset.theme = theme;
  } else {
    link.setAttribute('data-theme', theme);
  }
  const head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(link);
  link.onload = () => {
    removeTheme(currentLink);
    if (onLoad) {
      onLoad(link);
    }
  };
}

function removeTheme(link) {
  if (link) {
    link.parentNode.removeChild(link);
  }
}

module.exports = {
  changeTheme: changeTheme, // eslint-disable-line object-shorthand
  removeTheme: removeTheme // eslint-disable-line object-shorthand
};
