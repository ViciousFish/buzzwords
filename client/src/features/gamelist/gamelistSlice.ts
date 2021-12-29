import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Game from "buzzwords-shared/Game";

// Define a type for the slice state
interface GameListState {
  games: {
    [key: string]: Game;
  };
  gamesLoaded: boolean;
  isOpen: boolean;
}

// Define the initial state using that type
const initialState: GameListState = {
  games: {},
  gamesLoaded: false,
  isOpen: window.innerWidth >= 1024,
};

export const gamelistSlice = createSlice({
  name: "gamelist",
  initialState,
  reducers: {
    refreshReceived: (state, action: PayloadAction<GameListState["games"]>) => {
      state.games = action.payload;
      state.gamesLoaded = true;
    },
    updateGame: (state, action: PayloadAction<Game>) => {
      state.games[action.payload.id] = action.payload;
    },
    toggleIsOpen: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

// Action creators are generated for each case reducer function
export const { refreshReceived, updateGame, toggleIsOpen } =
  gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
