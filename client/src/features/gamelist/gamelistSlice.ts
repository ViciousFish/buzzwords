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
  gamesLoading: {
    [key: string]: "loading" | "loaded" | undefined;
  };
  gamesLoaded: boolean;
  isRefreshing: boolean;
  isOpen: boolean;
  showCompletedGames: boolean;
  showTutorialCard: boolean;
}

// Define the initial state using that type
const initialState: GameListState = {
  games: {},
  gamesLoading: {},
  gamesLoaded: false,
  isRefreshing: false,
  isOpen: window.innerWidth >= 1024,
  showCompletedGames: true,
  showTutorialCard: window.innerWidth >= 1024,
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
    refreshReceived: (
      state,
      action: PayloadAction<Record<string, ClientGame>>
    ) => {
      state.games = action.payload;
      state.isRefreshing = false;
      state.gamesLoaded = true;
    },
    updateGame: (state, action: PayloadAction<UpdateGamePayload>) => {
      const game = {
        ...state.games[action.payload.game.id],
        ...action.payload.game,
        lastSeenTurn: action.payload.lastSeenTurn,
      };
      if (action.payload.gameStateModalToQueue) {
        game.queuedGameStateModals.push(action.payload.gameStateModalToQueue);
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
    shiftGameStateModalQueueForGame: (state, action: PayloadAction<string>) => {
      state.games[action.payload].queuedGameStateModals.shift();
    },
    setShowTutorialCard: (state, action: PayloadAction<boolean>) => {
      state.showTutorialCard = action.payload;
    },
    deleteGame: (state, action: PayloadAction<string>) => {
      delete state.games[action.payload];
    },
    setGameLoading: (
      state,
      action: PayloadAction<{
        id: string;
        loading: "loading" | "loaded" | undefined;
      }>
    ) => {
      state.gamesLoading[action.payload.id] = action.payload.loading;
    },
    setIsRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  refreshReceived,
  updateGame,
  toggleIsOpen,
  toggleCompletedGames,
  setShowCompletedGames,
  shiftGameStateModalQueueForGame,
  setShowTutorialCard,
  deleteGame,
  setGameLoading,
  setIsRefreshing,
} = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
