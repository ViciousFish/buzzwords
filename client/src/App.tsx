import React from 'react';
import './App.css';
import Buzz from './Components/Zdog/Buzz';
import { Canvas } from '@react-three/fiber';
// import { Html } from '@react-three/drei';
import HexTile from './Components/three/HexTile';
import HexTileWord from './Components/Zdog/HexTileWord';
import CameraControls from './Components/three/CameraControls';
import { Box, Flex } from '@react-three/flex';

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
        <Canvas dpr={window.devicePixelRatio}>
          <Flex>
            <CameraControls />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <React.Suspense fallback={null}>
              <Box>
                <HexTile />
              </Box>
              <Box>
                <HexTile />
              </Box>
            </React.Suspense>
          </Flex>
        </Canvas>
      </header>
    </div>
  );
}

export default App;
