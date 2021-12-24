import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { GameList } from "../features/gamelist/GameList";
import Home from "../features/home-route/Home";
import Play from "../features/play-route/Play";

import { Globals } from "@react-spring/shared";
import { useAppSelector } from "./hooks";
import SidebarRightSide from "./SidebarRightSide";

Globals.assign({
  frameLoop: "always",
});

function App() {
  const isSidebarOpen = useAppSelector((state) => state.gamelist.isOpen);
  return (
    <BrowserRouter>
      <div className="App flex overflow-hidden max-w-[100vw] flex-row min-h-screen">
        <GameList />
        <SidebarRightSide>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play/:id" element={<Play />} />
          </Routes>
        </SidebarRightSide>
      </div>
    </BrowserRouter>
  );
}

export default App;
