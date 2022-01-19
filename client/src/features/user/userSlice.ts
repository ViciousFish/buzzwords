import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from 'ramda';

export interface User {
  id: string;
  nickname?: string;
}

// Define a type for the slice state
interface UserState {
  user: User | null;
  opponents: {
    [id: string]: User;
  };
}

// Define the initial state using that type
const initialState: UserState = {
  user: null,
  opponents: {},
};

export const gamelistSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userReceived: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    nicknameSet: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.nickname = action.payload;
      } else {
        console.error("cannot set nickname on non-existent user");
      }
    },
    opponentReceived: (state, action: PayloadAction<User>) => {
      state.opponents[action.payload.id] = action.payload;
    },
    maybeOpponentNicknameUpdated: (
      state,
      action: PayloadAction<{ id: string; nickname: string }>
    ) => {
      if (state.opponents[action.payload.id]) {
        state.opponents[action.payload.id].nickname = action.payload.nickname;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  userReceived,
  nicknameSet,
  opponentReceived,
  maybeOpponentNicknameUpdated,
} = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
