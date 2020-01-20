import { changeTheme } from '../../../src/index';

import './main.less';

const themes = process.themes; // eslint-disable-line prefer-destructuring
const buttonsContainer = document.getElementById('buttons');
let currentLink;

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
    changeTheme(key, themes[key], currentLink, link => (currentLink = link));
  };
  buttonsContainer.appendChild(button);
});

