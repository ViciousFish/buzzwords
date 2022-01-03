import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Globals } from "@react-spring/shared";
import SidebarRightSide from "./SidebarRightSide";
import GameList from "../features/gamelist/GameList";

import Home from "../features/home-route/Home";
import Play from "../features/play-route/Play";

Globals.assign({
  frameLoop: "always",
});

// const HomeLaz = lazy(() => import("../features/home-route/Home"));
// const PlayLazy = lazy(() => import("../features/play-route/Play"));

function App() {
  return (
    <BrowserRouter>
      <div className="App flex overflow-hidden max-w-[100vw] flex-row safe-area-pad">
        <GameList />
        <SidebarRightSide>
          {/* <React.Suspense fallback={<></>}> */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/play/:id" element={<Play />} />
            </Routes>
          {/* </React.Suspense> */}
        </SidebarRightSide>
      </div>
    </BrowserRouter>
  );
}

export default App;
