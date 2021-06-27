import React from "react";
import "./App.css";
// import Buzz from "./Components/Zdog/Buzz";

import { Canvas } from "@react-three/fiber";
import { Html, Stats, useProgress } from "@react-three/drei";
import CameraControls from "./Components/three/CameraControls";
import HexWord from "./Components/three/HexWord";
import { Buzz } from "./Components/three/Buzz";

/* Three TODO
- hexagon
  - rounded corners
- drag rotate
- animate with spring
- text
- word component (?textBufferGeometry?)
*/

function App() {
  console.log(window.devicePixelRatio);
  const { progress } = useProgress();
  const dpr = (
    <>
      {window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 2)}
    </>
  );
  return (
    <div className="App">
      <header className="App-header">
        {!import.meta.env.PROD && dpr}
        {/* <Buzz /> */}
        {/* <div > */}
        <Canvas
          style={{
            touchAction: "none",
            margin: "1em",
            height: 500,
            minWidth: 600,
          }}
          camera={{
            position: [0, 0, 100],
            zoom: 20,
          }}
          shadows
          orthographic
          dpr={Math.max(window.devicePixelRatio, 2)}
          flat
        >
          <Buzz position={[0, 5, 0]} />
          {!import.meta.env.PROD && <Stats />}
          {/* <CameraControls /> */}
          <ambientLight />
          <directionalLight position={[10, 10, 10]} />
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            <group position={[0, -2, 0]}>
              <HexWord position={[0, 0, 0]} text="COMING" />
              <HexWord position={[0, -4.8, 0]} text="SOON!" />
            </group>
          </React.Suspense>
        </Canvas>
        {/* </div> */}
      </header>
    </div>
  );
}

export default App;
