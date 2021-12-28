import React, { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Globals } from "@react-spring/shared";
import SidebarRightSide from "./SidebarRightSide";
import GameList from "../features/gamelist/GameList";

Globals.assign({
  frameLoop: "always",
});

const HomeLazy = lazy(() => import("../features/home-route/Home"));
const PlayLazy = lazy(() => import("../features/play-route/Play"));

function App() {
  return (
    <BrowserRouter>
      <div className="App flex overflow-hidden max-w-[100vw] flex-row min-h-screen">
        <GameList />
        <SidebarRightSide>
          <React.Suspense fallback={<></>}>
            <Routes>
              <Route path="/" element={<HomeLazy />} />
              <Route path="/play/:id" element={<PlayLazy />} />
            </Routes>
          </React.Suspense>
        </SidebarRightSide>
      </div>
    </BrowserRouter>
  );
}

export default App;
