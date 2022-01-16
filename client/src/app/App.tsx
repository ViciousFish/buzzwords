import React, { lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Globals } from "@react-spring/shared";
import FaviconNotification from "favicon-notification";

import SidebarRightSide from "./SidebarRightSide";
import GameList from "../features/gamelist/GameList";
import { useAppDispatch, useAppSelector } from "./hooks";
import { initAction } from "./appActions";
import { ToastContainer } from "react-toastify";
import TutorialModal from "../features/game/TutorialModal";
import { getUnseenMoveCount } from "../features/gamelist/gamelistSelectors";
import { handleWindowFocusThunk } from "../features/game/gameActions";
import ReactTooltip from "react-tooltip";

import.meta.env.PROD &&
  Globals.assign({
    frameLoop: "always",
  });

FaviconNotification.init({
  color: "#0000CC",
});

const HomeLazy = lazy(() => import("../features/home-route/Home"));
const PlayLazy = lazy(() => import("../features/play-route/Play"));

function App() {
  const dispatch = useAppDispatch();
  const showingTutorialModal = useAppSelector(
    (state) => state.game.showingTutorialModal
  );

  const hasUnseenMove = Boolean(useAppSelector(getUnseenMoveCount));

  useEffect(() => {
    dispatch(initAction());

    const handleFocus = () => dispatch(handleWindowFocusThunk(true));
    const handleBlur = () => dispatch(handleWindowFocusThunk(false));
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [dispatch]);

  useEffect(() => {
    if (hasUnseenMove) {
      FaviconNotification.add();
      document.title = "[Your turn] Buzzwords";
    } else {
      FaviconNotification.remove();
      document.title = "Buzzwords";
    }
  }, [hasUnseenMove]);

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
      <ToastContainer toastClassName="bg-primary text-darkbrown rounded-lg" />
      {showingTutorialModal && <TutorialModal />}
      <ReactTooltip />
    </BrowserRouter>
  );
}

export default App;
