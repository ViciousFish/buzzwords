import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";

import Game, { ShallowGame } from "buzzwords-shared/Game";
import { GameStateModalType } from "../game/GameStateModal";
import { getHasDismissedTutorialCard } from "./gamelistActions";

export interface ClientGameMeta {
  queuedGameStateModals: GameStateModalType[];
}

interface GameListState {
  games: {
    [id: string]: Game | ShallowGame;
  };
  gameMetas: {
    [id: string]: ClientGameMeta;
  };
  gamesLoading: {
    [id: string]: "loading" | "loaded" | undefined;
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
  gameMetas: {},
  gamesLoading: {},
  gamesLoaded: false,
  isRefreshing: false,
  isOpen: false,
  showCompletedGames: false,
  showTutorialCard: !getHasDismissedTutorialCard(),
};

interface UpdateGamePayload {
  game: Game;
  gameStateModalToQueue: GameStateModalType | null;
}

export const gamelistSlice = createSlice({
  name: "gamelist",
  initialState,
  reducers: {
    refreshReceived: (
      state,
      action: PayloadAction<{ [id: string]: ShallowGame }>
    ) => {
      // @ts-ignore
      state.games = R.mergeDeepRight<
        { [id: string]: Game | ShallowGame },
        { [id: string]: ShallowGame }
      >(state.games, action.payload);
      state.isRefreshing = false;
      state.gamesLoaded = true;
    },
    updateGame: (state, action: PayloadAction<UpdateGamePayload>) => {
      const game = {
        ...state.games[action.payload.game.id],
        ...action.payload.game,
      };
      if (state.gameMetas[game.id]) {
        if (action.payload.gameStateModalToQueue) {
          state.gameMetas[game.id].queuedGameStateModals.push(
            action.payload.gameStateModalToQueue
          );
        }
      } else {
        state.gameMetas[game.id] = {
          queuedGameStateModals: action.payload.gameStateModalToQueue
            ? [action.payload.gameStateModalToQueue]
            : [],
        };
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
      state.gameMetas[action.payload].queuedGameStateModals.shift();
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
  setGameLoading,
  setIsRefreshing,
} = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;

export function isFullGame(game: Game | ShallowGame): game is Game {
  return Boolean((game as Game).moves)
}