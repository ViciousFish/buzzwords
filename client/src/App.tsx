import React from "react";

import { Counter } from "./features/counter/Counter";
import { GameList } from "./features/gamelist/GameList";
import { BrowserRouter } from "react-router-dom";
import Home from "./features/home-route/Home";

function App() {
  const dpr = (
    <>
      {window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 1)}
    </>
  );
  return (
    <BrowserRouter>
      <div className="App">
        <GameList />
        <header className="App-header h-screen flex flex-col items-stretch">
          {!import.meta.env.PROD && (
            <div className="ml-20 flex justify-around">
              <Counter />
              {dpr}
            </div>
          )}
          <div className="flex-auto flex-shrink bg-primary min-h-0">
            <Home />
          </div>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
