import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import { HexCoord } from "buzzwords-shared/types";
import HexGrid from "buzzwords-shared/hexgrid";
import * as R from "ramda";

// Local bot move with serialized date (string instead of Date for Redux)
export interface LocalBotMove {
  grid: HexGrid;
  coords: HexCoord[];
  letters: string[];
  player: 0 | 1;
  date: string; // ISO string for serializability
  shuffle?: boolean;
  pass?: boolean;
  forfeit?: boolean;
}

export interface LocalBotGameState extends BuzzwordsGameState {
  isTutorial: boolean;
  currentPlayer: 0 | 1;
  turn: number;
  gameover: boolean;
  winner: string | null;
  moves: LocalBotMove[];
  lastMoveCapitalCaptured: boolean; // Track if last move captured capital for bonus turn
  viewedMoveIndex: number | null; // Index of move being viewed in detail, or null for list view
}

export interface LocalBotState {
  games: { [gameId: string]: LocalBotGameState };
  mostRecentGameId: string | null;
  botMoveInProgress: { [gameId: string]: boolean };
}

const initialState: LocalBotState = {
  games: {},
  mostRecentGameId: null,
  botMoveInProgress: {},
};

export const localBotSlice = createSlice({
  name: "localBot",
  initialState,
  reducers: {
    initializeLocalBotGame: (
      state,
      action: PayloadAction<{
        gameId?: string;
        grid: HexGrid;
        difficulty?: number;
        isTutorial: boolean;
      }>
    ) => {
      const gameId = action.payload.gameId || nanoid();
      const game: LocalBotGameState = {
        id: gameId,
        grid: R.clone(action.payload.grid),
        difficulty: action.payload.difficulty ?? 3,
        isTutorial: action.payload.isTutorial,
        selection: [],
        currentPlayer: 0,
        turn: 1,
        gameover: false,
        winner: null,
        moves: [],
        lastMoveCapitalCaptured: false,
        viewedMoveIndex: null,
      };
      state.games[gameId] = game;
      state.mostRecentGameId = gameId;
    },
    // maybe we don't want this
    loadLocalBotGame: (state, action: PayloadAction<string>) => {
      const gameId = action.payload;
      if (state.games[gameId]) {
        state.mostRecentGameId = gameId;
      }
    },
    setCurrentLocalBotGame: (state, action: PayloadAction<string | null>) => {
      state.mostRecentGameId = action.payload;
    },
    deleteLocalBotGame: (state, action: PayloadAction<string>) => {
      delete state.games[action.payload];
      if (state.mostRecentGameId === action.payload) {
        state.mostRecentGameId = null;
      }
    },
    updateSelection: (
      state,
      action: PayloadAction<{ gameId: string; selection: HexCoord[] }>
    ) => {
      const game = state.games[action.payload.gameId];
      if (game) {
        game.selection = action.payload.selection;
      }
    },
    // playWord will be handled by a thunk that calls the game logic
    // This reducer just updates the state after the move is processed
    playWordSuccess: (
      state,
      action: PayloadAction<{
        gameId: string;
        grid: HexGrid;
        currentPlayer: 0 | 1;
        turn: number;
        gameover: boolean;
        winner: string | null;
        move: LocalBotMove;
        capitalCaptured: boolean;
      }>
    ) => {
      const game = state.games[action.payload.gameId];
      if (game) {
        game.grid = action.payload.grid;
        game.selection = [];
        game.currentPlayer = action.payload.currentPlayer;
        game.turn = action.payload.turn;
        game.gameover = action.payload.gameover;
        game.winner = action.payload.winner;
        game.moves.push(action.payload.move);
        game.lastMoveCapitalCaptured = action.payload.capitalCaptured;
        // Clear bot move in progress flag after move completes
        delete state.botMoveInProgress[action.payload.gameId];
      }
    },
    setBotMoveInProgress: (
      state,
      action: PayloadAction<{ gameId: string; inProgress: boolean }>
    ) => {
      if (action.payload.inProgress) {
        state.botMoveInProgress[action.payload.gameId] = true;
      } else {
        delete state.botMoveInProgress[action.payload.gameId];
      }
    },
    pass: (state, action: PayloadAction<{ gameId: string }>) => {
      const game = state.games[action.payload.gameId];
      if (game && !game.gameover) {
        game.currentPlayer = (game.currentPlayer === 0 ? 1 : 0) as 0 | 1;
        game.turn += 1;
        game.selection = [];
        // Clear bot move in progress flag after pass
        delete state.botMoveInProgress[action.payload.gameId];
      }
    },
    setViewedMoveIndex: (
      state,
      action: PayloadAction<{ gameId: string; moveIndex: number | null }>
    ) => {
      const game = state.games[action.payload.gameId];
      if (game) {
        game.viewedMoveIndex = action.payload.moveIndex;
      }
    },
    clearViewedMove: (state, action: PayloadAction<{ gameId: string }>) => {
      const game = state.games[action.payload.gameId];
      if (game) {
        game.viewedMoveIndex = null;
      }
    },
  },
});

export const {
  initializeLocalBotGame,
  loadLocalBotGame,
  setCurrentLocalBotGame,
  deleteLocalBotGame,
  updateSelection,
  playWordSuccess,
  pass,
  setBotMoveInProgress,
  setViewedMoveIndex,
  clearViewedMove,
} = localBotSlice.actions;

export default localBotSlice.reducer;

