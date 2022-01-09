import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Game from "buzzwords-shared/Game";

export interface ClientGame extends Game {
  lastSeenTurn: number;
}

interface GameListState {
  games: {
    [key: string]: ClientGame;
  };
  gamesLoaded: boolean;
  isOpen: boolean;
  showCompletedGames: boolean;
  showAuthPrompt: boolean;
}

// Define the initial state using that type
const initialState: GameListState = {
  games: {},
  gamesLoaded: false,
  isOpen: window.innerWidth >= 1024,
  showCompletedGames: true,
  showAuthPrompt: true,
};

export const gamelistSlice = createSlice({
  name: "gamelist",
  initialState,
  reducers: {
    refreshReceived: (state, action: PayloadAction<Record<string, ClientGame>>) => {
      state.games = action.payload;
      state.gamesLoaded = true;
    },
    updateGame: (state, action: PayloadAction<ClientGame>) => {
      state.games[action.payload.id] = action.payload;
    },
    toggleIsOpen: (state) => {
      state.isOpen = !state.isOpen;
    },
    toggleCompletedGames: (state) => {
      state.showCompletedGames = !state.showCompletedGames;
    },
    setShowCompletedGames: (state, action: PayloadAction<boolean>) => {
      state.showCompletedGames = action.payload;
    },
    toggleAuthPrompt: (state) => {
      state.showAuthPrompt = !state.showAuthPrompt;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  refreshReceived,
  updateGame,
  toggleIsOpen,
  toggleCompletedGames,
  setShowCompletedGames,
  toggleAuthPrompt,
} = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
