import React from "react";
import { BrowserRouter } from "react-router-dom";

import { GameList } from "./features/gamelist/GameList";
import Home from "./features/home-route/Home";

function App() {
  const dpr = (
    <>
      {window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 1)}
    </>
  );
  return (
    <BrowserRouter>
    {/* TODO: switch app main from flex to grid? */}
      <div className="App flex sm:flex-col lg:flex-row h-screen bg-primary">
        <GameList />
        <div className="flex flex-auto flex-col">
          {!import.meta.env.PROD && (
            <div className="ml-20 flex justify-around">
              {dpr}
            </div>
          )}
          <Home />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
