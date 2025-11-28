import { configureStore } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import gameReducer from "../features/game/gameSlice";
import gamelistReducer from "../features/gamelist/gamelistSlice";
import userReducer from "../features/user/userSlice";
import settingsReducer from '../features/settings/settingsSlice';
import localBotReducer from "../features/bgio-board/localBotSlice";
import { localBotPersistenceMiddleware, loadAllLocalBotGames, loadCurrentLocalBotGameId } from "../features/bgio-board/localBotPersistence";
import { localBotMiddleware } from "../features/bgio-board/localBotMiddleware";

// Load local bot games and current game ID from localStorage on store initialization
const loadedGames = loadAllLocalBotGames();
const loadedCurrentGameId = loadCurrentLocalBotGameId();

// Validate that the current game ID actually exists in the loaded games
const validatedCurrentGameId =
  loadedCurrentGameId && loadedGames[loadedCurrentGameId]
    ? loadedCurrentGameId
    : null;

export const store = configureStore({
  reducer: {
    game: gameReducer,
    gamelist: gamelistReducer,
    user: userReducer,
    settings: settingsReducer,
    localBot: localBotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localBotPersistenceMiddleware, localBotMiddleware),
  preloadedState: {
    localBot: {
      games: loadedGames || {},
      mostRecentGameId: validatedCurrentGameId,
      botMoveInProgress: {},
    },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>

