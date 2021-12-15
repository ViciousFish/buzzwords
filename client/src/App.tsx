import React from "react";
// import Buzz from "./Components/Zdog/Buzz";

import { Canvas } from "@react-three/fiber";
import App3d from "./App3d";

import { Counter } from "./features/counter/Counter";
import { GameList } from "./features/gamelist/GameList";
import { useContextBridge } from "@react-three/drei";
import { ReactReduxContext } from "react-redux";

function App() {
  const dpr = (
    <>
      {window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 1)}
    </>
  );
  const ReduxProvider = useContextBridge(ReactReduxContext);
  return (
    <div className="App">
      <header className="App-header h-screen flex flex-col items-stretch">
        {!import.meta.env.PROD && (
          <div className="ml-20 flex justify-around">
            <Counter />
            {dpr}
          </div>
        )}
        <div className="flex-auto flex-shrink bg-primary min-h-0">
          <Canvas
            camera={{
              position: [0, 0, 10],
              zoom: 2,
            }}
            gl={{
              powerPreference: "low-power",
            }}
            orthographic
            dpr={Math.max(window.devicePixelRatio, 1)}
            flat
          >
            <ReduxProvider>
              <App3d />
            </ReduxProvider>
          </Canvas>
        </div>
      </header>
      <GameList />
    </div>
  );
}

export default App;
