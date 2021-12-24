import { configureStore } from "@reduxjs/toolkit";

import gameReducer from "../features/game/gameSlice";
import gamelistReducer from "../features/gamelist/gamelistSlice";
import userReducer from "../features/user/userSlice";
import { subscribeSocket } from "./socket";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    gamelist: gamelistReducer,
    user: userReducer
  },
});

subscribeSocket(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => any;

if (!import.meta.env.PROD) {
  // @ts-ignore
  window.dev = {
    store
  }
}