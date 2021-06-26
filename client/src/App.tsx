import React from 'react';
import './App.css';
import Buzz from './Components/Zdog/Buzz';
import { Canvas } from 'react-three-fiber';
import Polygon from './Components/three/HexTile';
import HexTileWord from './Components/Zdog/HexTileWord';
import CameraControls from './Components/three/CameraControls';

/* three TODO
- hexagon
  - rounded corners
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
          {/* <CameraControls /> */}
          <ambientLight />
          {/* <pointLight position={[10, 10, 10]} /> */}
          <Polygon vertices={6} radius={Math.PI} position={[0, 0, 0]} />
        </Canvas>
      </header>
    </div>
  );
}

export default App;
