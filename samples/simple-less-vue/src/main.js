import { switchTheme, getThemes } from '../../../src/index';

import './main.less';

const themes = getThemes();
const buttonsContainer = document.getElementById('buttons');

const app = new Vue({
  el: '#app',
  data: {
    message: 'Title for vue'
  }
});

const keys = Object.keys(themes);
keys.forEach((key) => {
  const button = document.createElement('button');
  button.innerHTML = key;
  button.onclick = () => {
    switchTheme({ theme: key });
  };
  buttonsContainer.appendChild(button);
});

