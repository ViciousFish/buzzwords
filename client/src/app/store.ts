import { configureStore } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import gameReducer from "../features/game/gameSlice";
import gamelistReducer from "../features/gamelist/gamelistSlice";
import userReducer from "../features/user/userSlice";
import settingsReducer from '../features/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    gamelist: gamelistReducer,
    user: userReducer,
    settings: settingsReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// export type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => any;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>


if (!import.meta.env.PROD) {
  // @ts-ignore
  window.dev = {
    store
  }
}