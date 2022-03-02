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
  showTutorialCard: boolean;
}

// Define the initial state using that type
const initialState: GameListState = {
  games: {},
  gamesLoaded: false,
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
      Object.keys(action.payload).forEach((id) => {
        if (
          action.payload[id].moves.length >=
          (state.games[id]?.moves.length ?? 0)
        ) {
          state.games[id] = action.payload[id];
        }
      });
      Object.keys(state.games).forEach((id) => {
        if (!action.payload[id]) {
          delete state.games[id];
        }
      });
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
} = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
