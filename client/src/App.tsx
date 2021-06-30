import React from "react";
import "./App.css";
// import Buzz from "./Components/Zdog/Buzz";

import { Canvas } from "@react-three/fiber";
import { Html, Stats, useProgress } from "@react-three/drei";
import HexWord from "./Components/three/HexWord";
import { Buzz } from "./Components/three/Buzz";
import { Flex, Box } from "@react-three/flex";

import { Counter } from "./features/counter/Counter";

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
        {process.env.NODE_ENV !== "production" && <Counter />}
        {process.env.NODE_ENV !== "production" && dpr}
        <Canvas
          style={{
            touchAction: "none",
            margin: "1em",
            height: 600,
            minWidth: 600,
            // background: 'green'
          }}
          camera={{
            position: [0, 0, 80],
            zoom: 5,
          }}
          shadows
          // orthographic
          dpr={Math.max(window.devicePixelRatio, 2)}
          flat
        >
          <Flex flexDirection="column" justifyContent="center" pt={4}>
            <Buzz />
            {process.env.NODE_ENV !== "production" && <Stats />}
            {/* <CameraControls /> */}
            <ambientLight />
            <directionalLight position={[10, 10, 10]} />
            <React.Suspense fallback={<Box><Html center>{progress} % loaded</Html></Box>}>
              <group position={[0, 2, 0]}>
                <HexWord text="COMING" />
                <HexWord text="SOON!" />
              </group>
            </React.Suspense>
          </Flex>
        </Canvas>
        {/* </div> */}
      </header>
    </div>
  );
}

export default App;
