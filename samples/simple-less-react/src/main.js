import { switchTheme, getThemes } from '../../../src/index';

import './main.less';

class Info extends React.Component {
  render() {
    return (
      <div className={this.props.className}>
        {this.props.title}
      </div>);
  }
}

const themes = getThemes();
const buttonsContainer = document.getElementById('buttons');

const appContainer = document.getElementById('app');
ReactDOM.render(<Info title='Title for react' className='title' />, appContainer);

const keys = Object.keys(themes);
keys.forEach((key) => {
  const button = document.createElement('button');
  button.innerHTML = key;
  button.onclick = () => {
    switchTheme({theme: key});
  };
  buttonsContainer.appendChild(button);
});

