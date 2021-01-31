import React from 'react';
import './App.css';
import Buzz from './Components/Zdog/Buzz';
import { Canvas } from 'react-three-fiber';
import HexTile from './Components/three/HexTile';
import HexTileWord from './Components/Zdog/HexTileWord';

/* three TODO
- hexagon
- drag rotate
- animate with spring
- text
- word component (?textBufferGeometry?)
*/

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Buzz />
        <HexTileWord id="soon" value="SOON!" />
        <Canvas
          pixelRatio={window.devicePixelRatio}
        >
          <ambientLight />
          {/* <pointLight position={[10, 10, 10]} /> */}
          <HexTile radius={2} position={[0, 0, 0]} />
        </Canvas>
      </header>
    </div>
  );
}

export default App;
