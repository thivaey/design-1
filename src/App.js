import {Visualization} from './components/Visualization';

import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Visualization />
        <p>
          Landing page for Design 1
        </p>
      </header>
    </div>
  );
}

export default App;
