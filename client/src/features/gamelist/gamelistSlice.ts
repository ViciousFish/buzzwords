import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Game from "buzzwords-shared/Game";
import { GameStateModalType } from "../game/GameStateModal";

export interface ClientGame extends Game {
  lastSeenTurn: number;
  queuedGameStateModals: GameStateModalType[];
}

interface GameListState {
  games: {
    [key: string]: ClientGame;
  };
  gamesLoaded: boolean;
  isOpen: boolean;
  showCompletedGames: boolean;
}

// Define the initial state using that type
const initialState: GameListState = {
  games: {},
  gamesLoaded: false,
  isOpen: window.innerWidth >= 1024,
  showCompletedGames: true,
};

interface UpdateGamePayload {
  game: Game;
  lastSeenTurn: number;
  gameStateModalToQueue: GameStateModalType | null;
}

export const gamelistSlice = createSlice({
  name: "gamelist",
  initialState,
  reducers: {
    refreshReceived: (state, action: PayloadAction<Record<string, ClientGame>>) => {
      state.games = action.payload;
      state.gamesLoaded = true;
    },
    updateGame: (state, action: PayloadAction<UpdateGamePayload>) => {
      const game = {
        ...state.games[action.payload.game.id],
        ...action.payload.game,
        lastSeenTurn: action.payload.lastSeenTurn,
      };
      if (action.payload.gameStateModalToQueue) {
        game.queuedGameStateModals.push(action.payload.gameStateModalToQueue)
      }
      state.games[action.payload.game.id] = game;
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
  },
});

// Action creators are generated for each case reducer function
export const {
  refreshReceived,
  updateGame,
  toggleIsOpen,
  toggleCompletedGames,
  setShowCompletedGames,
} = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
