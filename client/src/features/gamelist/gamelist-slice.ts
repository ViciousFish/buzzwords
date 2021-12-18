import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Game } from "../game/game";

// Define a type for the slice state
interface GameListState {
  games: {
    [key: string]: Game;
  };
}

// Define the initial state using that type
const initialState: GameListState = {
  games: {},
};

export const gamelistSlice = createSlice({
  name: "gamelist",
  initialState,
  reducers: {
    refreshReceived: (state, action: PayloadAction<GameListState["games"]>) => {
      state.games = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { refreshReceived } = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
