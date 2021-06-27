import React from 'react';
import './App.css';
import Buzz from './Components/Zdog/Buzz';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei'
import HexTile from './Components/three/HexTile';
import CameraControls from './Components/three/CameraControls';
import HexLetter from './Components/three/HexLetter';
import HexWord from './Components/three/HexWord';

/* three TODO
- hexagon
  - rounded corners
- drag rotate
- animate with spring
- text
- word component (?textBufferGeometry?)
*/

function App() {
  const { progress } = useProgress()
  return (
    <div className="App">
      <header className="App-header">
        <Buzz />
        <Canvas
          // gl={{ antialias: false }}
          camera={{
            position: [0, 0, 100],
            zoom: 20
          }}
          dpr={window.devicePixelRatio * 2}
          // orthographic
          flat
        >
          <CameraControls />
          <ambientLight />
          {/* <pointLight position={[10, 10, 10]} /> */}
          <directionalLight position={[5, 5, 10]} />
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            {/* <HexLetter letter='H' position={[0, 0, 0]} /> */}
            <HexWord children="SOON" />
          </React.Suspense>
        </Canvas>
      </header>
    </div>
  );
}

export default App;
