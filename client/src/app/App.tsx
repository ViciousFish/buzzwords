import React, { lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
// import { Globals } from "@react-spring/shared";
import FaviconNotification from "favicon-notification";

import { useAppDispatch, useAppSelector } from "./hooks";
import { initAction } from "./appActions";
import { ToastContainer } from "react-toastify";
import TutorialModal from "../features/game/TutorialModal";
import { handleWindowFocusThunk } from "../features/game/gameActions";
import ReactTooltip from "react-tooltip";
import { getHowManyGamesAreMyTurn } from "../features/gamelist/gamelistSelectors";
import IPCRoutingComponent from "./IPCRoutingComponent";
import NativeAppAd from "../presentational/NativeAppAd";
import { SettingsPage } from "../features/settings/SettingsPage";
import { Helmet } from "react-helmet";
import {
  getBodyStyleFromTheme,
  getTheme,
} from "../features/settings/settingsSelectors";
import {
  ColorScheme,
  setCurrentSystemScheme,
} from "../features/settings/settingsSlice";

// not necessary, as long as there's always a 3d canvas on screen!
// import.meta.env.PROD &&
//   Globals.assign({
//     frameLoop: "always",
//   });

const isTouch = window.matchMedia("(pointer: coarse)").matches;

FaviconNotification.init({
  color: "#0000CC",
});

const MM = window.matchMedia("(prefers-color-scheme: dark)");

const HomeLazy = lazy(() => import("../features/home-route/Home"));
const PlayLazy = lazy(() => import("../features/play-route/Play"));
const AuthSuccessLazy = lazy(
  () => import("../features/auth-route/AuthSuccess")
);
const MainGameStructureLazy = lazy(() => import("./MainGameStructure"));

const ELECTRON = window.versions;
const Router = ELECTRON ? HashRouter : BrowserRouter;

function App() {
  const theme = useAppSelector(getTheme);
  const colorScheme = useAppSelector(state => state.settings.colorScheme);

  const dispatch = useAppDispatch();
  const showingTutorialModal = useAppSelector(
    (state) => state.game.showingTutorialModal
  );

  const numberOfGamesWaitingForPlayer = useAppSelector((state) =>
    getHowManyGamesAreMyTurn(state, null)
  );

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
    if (numberOfGamesWaitingForPlayer) {
      FaviconNotification.add();
      document.title = `[${numberOfGamesWaitingForPlayer}] Buzzwords`;
    } else {
      FaviconNotification.remove();
      document.title = "Buzzwords";
    }
  }, [numberOfGamesWaitingForPlayer]);

  const matchMediaCallback = useCallback((event: MediaQueryListEvent) => {
    dispatch(
      setCurrentSystemScheme(
        event.matches ? ColorScheme.Dark : ColorScheme.Light
      )
    );
  }, [dispatch]);

  useEffect(() => {
    MM.addEventListener("change", matchMediaCallback);
    return () => {
      MM.removeEventListener("change", matchMediaCallback);
    };
  }, [matchMediaCallback]);

  return (
    <>
      {/* @ts-ignore */}
      <Helmet>
        {/* @ts-ignore */}
        <body className={colorScheme} style={getBodyStyleFromTheme(theme)} />
      </Helmet>
      <Router>
        <IPCRoutingComponent />
        <React.Suspense fallback={<></>}>
          <Routes>
            <Route element={<MainGameStructureLazy />}>
              <Route
                path="/"
                element={
                  <React.Suspense fallback={<></>}>
                    <HomeLazy />
                  </React.Suspense>
                }
              />
              <Route
                path="/play/:id"
                element={
                  <React.Suspense fallback={<></>}>
                    <PlayLazy />
                  </React.Suspense>
                }
              />
              <Route
                path="/download"
                element={
                  <div className="flex justify-center items-center bg-lightbg h-full">
                    <NativeAppAd />
                  </div>
                }
              />
            </Route>
            <Route path="/auth/success" element={<AuthSuccessLazy />} />
          </Routes>
        </React.Suspense>
        <ToastContainer toastClassName="bg-primary text-darkbrown rounded-lg" />
        {showingTutorialModal && <TutorialModal />}
        {/* @ts-ignore ????? */}
        {!isTouch && <ReactTooltip />}
      </Router>
    </>
  );
}

export default App;
