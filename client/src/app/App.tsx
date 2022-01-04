import React, { lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Globals } from "@react-spring/shared";
import SidebarRightSide from "./SidebarRightSide";
import GameList from "../features/gamelist/GameList";
import { useAppDispatch } from "./hooks";
import { initAction } from "./appActions";
import { ToastContainer } from "react-toastify";

// Globals.assign({
//   frameLoop: "always",
// });

const HomeLazy = lazy(() => import("../features/home-route/Home"));
const PlayLazy = lazy(() => import("../features/play-route/Play"));

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initAction());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="App flex overflow-hidden max-w-[100vw] flex-row safe-area-pad">
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
      <ToastContainer toastClassName='bg-primary text-darkbrown rounded-lg' />
    </BrowserRouter>
  );
}

export default App;
