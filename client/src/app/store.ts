import { configureStore } from "@reduxjs/toolkit";

import counterReducer from "../features/counter/counter-slice";
import gamelistReducer from "../features/gamelist/gamelist-slice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    gamelist: gamelistReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => any;