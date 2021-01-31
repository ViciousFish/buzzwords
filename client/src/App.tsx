import React from 'react';
import logo from './logo.svg';
import './App.css';
import Buzz from './Components/Zdog/Buzz';
import HexTileWord from './Components/Zdog/HexTileWord';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Buzz />
        <HexTileWord id="soon" value="SOON!" />
      </header>
    </div>
  );
}

export default App;
