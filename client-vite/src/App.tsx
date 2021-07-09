import React from "react";
import "./App.css";
// import Buzz from "./Components/Zdog/Buzz";

import { Canvas } from "@react-three/fiber";
import App3d from "./Components/three/App3d";

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
  const dpr = (
    <>
      {window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 1)}
    </>
  );
  return (
    <div className="App">
      {!import.meta.env.PROD && <Counter />}
      {!import.meta.env.PROD && dpr}
      <header className="App-header">
        <Canvas
          camera={{
            position: [0, 0, 100],
            zoom: 2,
          }}
          gl={{
            powerPreference: "low-power",
          }}
          // orthographic
          dpr={Math.max(window.devicePixelRatio, 1)}
          flat
        >
          <App3d />
        </Canvas>
      </header>
    </div>
  );
}

export default App;
