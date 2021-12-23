import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { GameList } from "../features/gamelist/GameList";
import Home from "../features/home-route/Home";
import Play from "../features/play-route/Play";

function App() {
  const dpr = (
    <>
      {window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 1)}
    </>
  );
  return (
    <BrowserRouter>
      {/* TODO: switch app main from flex to grid? */}
      <div className="App flex overflow-hidden max-w-[100vw] flex-row min-h-screen">
        <GameList />
        {/* {!import.meta.env.PROD && (
            <div className="ml-20 flex justify-around">
              {dpr}
            </div>
          )} */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play/:id" element={<Play />} /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
