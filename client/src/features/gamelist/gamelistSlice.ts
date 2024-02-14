import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";

import Game, { ShallowGame } from "buzzwords-shared/Game";
import {
  Gamev2,
  GameplayState,
  GameplayEvent,
} from "buzzwords-shared/GamplaySlice";
import { GameStateModalType } from "../game/GameStateModal";
import { getHasDismissedTutorialCard } from "./gamelistActions";
import { enablePatches, applyPatches } from "immer";

enablePatches();

export interface ClientGameMeta {
  queuedGameStateModals: GameStateModalType[];
}

interface GameListState {
  games: {
    [id: string]: Game | ShallowGame;
  };
  v2games: {
    [id: string]: Gamev2;
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
  v2games: {},
  gameMetas: {},
  gamesLoading: {},
  gamesLoaded: false,
  isRefreshing: false,
  isOpen: false,
  showCompletedGames: false,
  showTutorialCard: false,
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
    updatev2Game: (
      state,
      action: PayloadAction<{
        event: GameplayEvent;
        id: string;
      }>
    ) => {
      const game = state.v2games[action.payload.id];
      if (!game) {
        const v1game = state.games[action.payload.id]
        state.v2games[action.payload.id] = {
          id: v1game.id,
          gampeplayState: {
            gameState: 'playable',
            users: v1game.users,
            vsAI: v1game.vsAI,
            turn: v1game.turn,
            currentGrid: (v1game as Game).grid,
            winner: v1game.winner
          },
          events: [], // TODO
          createdDate: v1game.createdDate ?? new Date(),
          updatedDate: v1game.updatedDate ?? new Date(),
          deleted: false
        }
      }
      const newGameplayState = applyPatches(
        state.v2games[action.payload.id].gampeplayState,
        action.payload.event.patches
      );
      state.v2games[action.payload.id].gampeplayState = newGameplayState;
      state.v2games[action.payload.id].updatedDate = new Date();
      state.v2games[action.payload.id].events.push(action.payload.event);
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
  updatev2Game,
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
  return Boolean((game as Game).moves);
}
