import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface ClientGame {
  id: string;
}

// Define a type for the slice state
interface GameListState {
  games: {
    [key: string]: ClientGame;
  };
  gamesArr: ClientGame[];
}

// Define the initial state using that type
const initialState: GameListState = {
  games: {},
  gamesArr: [],
};

export const gamelistSlice = createSlice({
  name: "gamelist",
  initialState,
  reducers: {
    refreshReceived: (state, action: PayloadAction<GameListState["games"]>) => {
      state.games = action.payload;
    },
    createNew: (state) => {
      fetch("/api/game", {
        method: "POST",
      })
        .then((response) => response.text())
        .then((id) => {
          state.games = { ...state.games, id: { id } };
          state.gamesArr = [...state.gamesArr, { id }];
        });
    },
  },
});

// Action creators are generated for each case reducer function
export const { refreshReceived, createNew } = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
