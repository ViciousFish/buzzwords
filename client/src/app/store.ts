import { configureStore } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import gameReducer from "../features/game/gameSlice";
import gamelistReducer from "../features/gamelist/gamelistSlice";
import userReducer from "../features/user/userSlice";
import settingsReducer from '../features/settings/settingsSlice';
import {reducer as endlessReducer} from '../features/endless-mode/endlessSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    gamelist: gamelistReducer,
    user: userReducer,
    settings: settingsReducer,
    endlessMode: endlessReducer,
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

