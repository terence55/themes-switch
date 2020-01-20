import { changeTheme } from '../../../src/index';

import './main.less';

const e = React.createElement;

class Info extends React.Component {
  render() {
    return e(
      'div',
      { className: this.props.className },
      this.props.title
    );
  }
}

const themes = process.themes; // eslint-disable-line prefer-destructuring
const buttonsContainer = document.getElementById('buttons');
let currentLink;

const appContainer = document.getElementById('app');
ReactDOM.render(e(Info, { title: 'Title for react', className: 'title' }), appContainer);

const keys = Object.keys(themes);
keys.forEach((key) => {
  const button = document.createElement('button');
  button.innerHTML = key;
  button.onclick = () => {
    changeTheme(key, themes[key], currentLink, link => (currentLink = link));
  };
  buttonsContainer.appendChild(button);
});

