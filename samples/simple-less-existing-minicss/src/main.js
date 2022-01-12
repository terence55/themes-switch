import { switchTheme, getThemes } from '../../../src/index';

import './main.less';

const themes = getThemes();
const buttonsContainer = document.getElementById('buttons');

const title = document.createElement('div');
title.innerHTML = 'Title';
title.className = 'title';
buttonsContainer.appendChild(title);

const desc = document.createElement('div');
desc.innerHTML = 'Description';
desc.className = 'desc';
buttonsContainer.appendChild(desc);

const keys = Object.keys(themes);
keys.forEach((key) => {
  const button = document.createElement('button');
  button.innerHTML = key;
  button.onclick = () => {
    switchTheme({ theme: key });
  };
  buttonsContainer.appendChild(button);
});

