import React, { useRef } from "react";
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
      <header className="App-header">
        {!import.meta.env.PROD && <Counter />}
        {!import.meta.env.PROD && dpr}
        <Canvas
          style={{
            touchAction: "none",
            margin: "1em",
            flex: 'auto',
            // height: '100%',
            // width: '100%'
            // height: 800,
            // minWidth: 600,
            // background: 'green'
          }}
          camera={
            {
              // position: [0, 0, 100],
              zoom: 4,
            }
          }
          shadows
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
