function changeTheme(theme, themeUrl, currentLink, onLoad) {
  if (theme === (currentLink && currentLink.dataset.theme)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = themeUrl;
  link.dataset.theme = theme;
  document.head.appendChild(link);
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
  changeTheme,
  removeTheme
};
