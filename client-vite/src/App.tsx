import React from "react";
import "./App.css";
import Buzz from "./Components/Zdog/Buzz";
import { Canvas } from "@react-three/fiber";
import { Html, Stats, useProgress } from "@react-three/drei";
import CameraControls from "./Components/three/CameraControls";
import HexWord from "./Components/three/HexWord";

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
  return (
    <div className="App">
      <header className="App-header">
        {/* {window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 2)} */}
        <Buzz />
        {/* <div > */}
        <Canvas
          style={{
            touchAction: "none",
            margin: "1em",
            height: 300,
            minWidth: 600,
          }}
          camera={{
            position: [0, 0, 100],
            zoom: 20,
          }}
          orthographic
          dpr={Math.max(window.devicePixelRatio, 2)}
          flat
        >
          {/* <Stats /> */}
          {/* <CameraControls /> */}
          <ambientLight />
          <directionalLight position={[5, 5, 10]} />
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            <HexWord position={[0, 2.4, 0]} text="COMING" />
            <HexWord position={[0, -2.4, 0]} text="SOON!" />
          </React.Suspense>
        </Canvas>
        {/* </div> */}
      </header>
    </div>
  );
}

export default App;
