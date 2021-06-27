import React from 'react';
import './App.css';
import Buzz from './Components/Zdog/Buzz';
import { Canvas } from '@react-three/fiber';
import HexTile from './Components/three/HexTile';
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
        <Canvas>
          <CameraControls />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <React.Suspense fallback={null}>
            <HexTile />
          </React.Suspense>
        </Canvas>
      </header>
    </div>
  );
}

export default App;
