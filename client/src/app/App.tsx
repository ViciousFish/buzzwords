// import React, { lazy, useCallback, useEffect } from "react";
// import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
// // import { Globals } from "@react-spring/shared";
// import FaviconNotification from "favicon-notification";
// import { StatusBar, Style } from "@capacitor/status-bar";
// import { Capacitor } from "@capacitor/core";
// import { raf } from "@react-spring/shared";
import { Logtail } from "@logtail/browser";

export const logtail = new Logtail("bTQ9NZVDhbZj4XmQsXbKDRmw");

// import { useAppDispatch, useAppSelector } from "./hooks";
// import { initAction } from "./appActions";
// import { toast, ToastContainer } from "react-toastify";
// import TutorialModal from "../features/game/TutorialModal";
// import { handleWindowFocusThunk } from "../features/game/gameActions";
// import ReactTooltip from "react-tooltip";
// import { getHowManyGamesAreMyTurn } from "../features/gamelist/gamelistSelectors";
// import IPCRoutingComponent from "./IPCRoutingComponent";
// import NativeAppAd from "../presentational/NativeAppAd";
// import { Helmet } from "react-helmet";
// import {
//   getBodyStyleFromTheme,
//   getTheme,
// } from "../features/settings/settingsSelectors";
// import {
//   ColorScheme,
//   setCurrentSystemScheme,
// } from "../features/settings/settingsSlice";
// import MobileRoutingComponent from "./MobileRoutingComponent";
// import { usePrevious } from "../utils/usePrevious";

// // not necessary, as long as there's always a 3d canvas on screen!
// // import.meta.env.PROD &&
// // Globals.assign({
// //   frameLoop: "demand",
// // });

// function frameLoop() {
//   raf.advance();
//   requestAnimationFrame(frameLoop);
// }

// const isTouch = window.matchMedia("(pointer: coarse)").matches;

// FaviconNotification.init({
//   color: "#0000CC",
// });

// const MM = window.matchMedia("(prefers-color-scheme: dark)");

// const HomeLazy = lazy(() => import("../features/home-route/Home"));
// const CreateLazy = lazy(
//   () => import("../features/create-game-route/CreateGame")
// );
// const PlayLazy = lazy(() => import("../features/play-game-route/PlayGame"));
// const AuthSuccessLazy = lazy(
//   () => import("../features/auth-route/AuthSuccess")
// );
// const MainGameStructureLazy = lazy(() => import("./MainGameStructure"));

// const ELECTRON = window.versions;
// const Router = ELECTRON ? HashRouter : BrowserRouter;
// const SIZZY = Boolean(window.navigator.userAgent.match(/Sizzy/));

// function App() {
//   const theme = useAppSelector(getTheme);
//   const colorScheme = useAppSelector((state) => state.settings.colorScheme);
//   const user = useAppSelector((state) => state.user.user);

//   const dispatch = useAppDispatch();
//   const showingTutorialModal = useAppSelector(
//     (state) => state.game.showingTutorialModal
//   );

//   const numberOfGamesWaitingForPlayer = useAppSelector((state) =>
//     getHowManyGamesAreMyTurn(state, null)
//   );

//   useEffect(() => {
//     frameLoop();
//   }, []);

//   const prevUser = usePrevious(user);
//   useEffect(() => {
//     if (user?.nickname && prevUser && !prevUser.nickname) {
//       toast(
//         `Your nickname has been set to "${user?.nickname}". You can change it from the settings menu`,
//         { type: "info", autoClose: 8000 }
//       );
//     }
//   });

//   useEffect(() => {
//     const cleanup = dispatch(initAction());

//     const handleFocus = () => dispatch(handleWindowFocusThunk(true));
//     const handleBlur = () => dispatch(handleWindowFocusThunk(false));
//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("blur", handleBlur);
//     return () => {
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("blur", handleBlur);
//       cleanup.then((cu) => cu());
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     if (numberOfGamesWaitingForPlayer) {
//       FaviconNotification.add();
//       document.title = `[${numberOfGamesWaitingForPlayer}] Buzzwords`;
//     } else {
//       FaviconNotification.remove();
//       document.title = "Buzzwords";
//     }
//   }, [numberOfGamesWaitingForPlayer]);

//   const matchMediaCallback = useCallback(
//     (event: MediaQueryListEvent) => {
//       dispatch(
//         setCurrentSystemScheme(
//           event.matches ? ColorScheme.Dark : ColorScheme.Light
//         )
//       );
//     },
//     [dispatch]
//   );

//   useEffect(() => {
//     MM.addEventListener("change", matchMediaCallback);
//     return () => {
//       MM.removeEventListener("change", matchMediaCallback);
//     };
//   }, [matchMediaCallback]);

//   useEffect(() => {
//     if (!Capacitor.isNativePlatform()) {
//       return;
//     }
//     if (colorScheme === ColorScheme.Dark) {
//       StatusBar.setStyle({ style: Style.Dark });
//     }
//     if (colorScheme === ColorScheme.Light) {
//       StatusBar.setStyle({ style: Style.Light });
//     }
//     if (colorScheme === ColorScheme.System) {
//       StatusBar.setStyle({ style: Style.Default });
//     }
//   }, [colorScheme]);

//   if (SIZZY) {
//     return (
//       <div className="m-8">
//         <h1 className="font-bold">Sizzy is not supported by buzzwords</h1>
//         <h2>The creator @thekitze is a dick on twitter</h2>
//         <p>
//           <a
//             className="text-blue-500 underline"
//             href="https://responsively.app/"
//           >
//             Responsively
//           </a>{" "}
//           is free and open source.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* @ts-ignore */}
//       <Helmet>
//         {/* @ts-ignore */}
//         <body className={colorScheme} style={getBodyStyleFromTheme(theme)} />
//       </Helmet>
//       <Router>
//         <IPCRoutingComponent />
//         <MobileRoutingComponent />
//         <React.Suspense fallback={<></>}>
//           <Routes>
//             <Route element={<MainGameStructureLazy />}>
//               <Route
//                 path="/"
//                 element={
//                   <React.Suspense fallback={<></>}>
//                     <HomeLazy />
//                   </React.Suspense>
//                 }
//               />
//               <Route
//                 path="/play"
//                 element={
//                   <React.Suspense fallback={<></>}>
//                     <CreateLazy />
//                   </React.Suspense>
//                 }
//               />
//               <Route
//                 path="/play/:id"
//                 element={
//                   <React.Suspense fallback={<></>}>
//                     <PlayLazy />
//                   </React.Suspense>
//                 }
//               />
//               <Route
//                 path="/download"
//                 element={
//                   <div className="flex justify-center items-center bg-lightbg h-full">
//                     <NativeAppAd />
//                   </div>
//                 }
//               />
//             </Route>
//             <Route path="/auth/success" element={<AuthSuccessLazy />} />
//           </Routes>
//         </React.Suspense>
//         <ToastContainer
//           className="p-t-safe"
//           toastClassName="bg-primary text-darkbrown rounded-lg"
//         />
//         {showingTutorialModal && <TutorialModal />}
//         {/* @ts-ignore ????? */}
//         {!isTouch && <ReactTooltip />}
//       </Router>
//     </>
//   );
// }

// export default App;
import React, { useState } from "react";
import { BoardProps, Client } from "boardgame.io/react";
import { Buzzwords, BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import { GameBoardTiles } from "../features/game/GameBoardTiles";
import Canvas from "../features/canvas/Canvas";
import { QRCoord } from "../features/hexGrid/hexGrid";
import { HexCoord } from "buzzwords-shared/types";
import { ActionButton } from "../presentational/ActionButton";

function BGIOGameBoard({ G, ctx, moves }: BoardProps<BuzzwordsGameState>) {
  const [selection, setSelection] = useState<HexCoord[]>([]);
  const word = selection.map(({ q, r }) => G.grid[`${q},${r}`].value);
  return (
    <div className="h-screen w-[80%]">
      <div className="flex justify-center">
        <h1>{word}</h1>
        <ActionButton
          onPress={() => {
            moves.playWord(selection);
          }}
        >
          playWord
        </ActionButton>
      </div>
      <Canvas isGameboard>
        <GameBoardTiles
          revealLetters
          enableSelection
          onToggleTile={(coord) => {
            const [q, r] = coord.split(",").map(Number);
            const index = selection.findIndex(x => x.q === q && x.r === r)
            if (index > -1) {
              selection.splice(index, 1);
              setSelection([...selection])
              return;
            }
            setSelection([...selection, { q, r }]);
          }}
          grid={G.grid}
          selection={selection}
          currentTurn={Number(ctx.currentPlayer) as 0 | 1}
        />
      </Canvas>
    </div>
  );
}

const App = Client({ game: Buzzwords, board: BGIOGameBoard });

export default App;
