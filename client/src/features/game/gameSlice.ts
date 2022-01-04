import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Move } from "buzzwords-shared/Game";
import HexGrid from "buzzwords-shared/hexgrid";
import { QRCoord } from "../hexGrid/hexGrid";

interface GameState {
  selectedTiles: {
    [position: QRCoord]: number;
  };
  selectionIndex: number;
  currentGame: string | null;
  replay: {
    move: Move | null;
    playbackState: number;
  };
}

const initialState: GameState = {
  selectedTiles: {},
  selectionIndex: 0,
  currentGame: null,
  replay: {
    move: null,
    playbackState: 0,
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    selectTile: (state, action: PayloadAction<QRCoord>) => {
      state.selectedTiles[action.payload] = state.selectionIndex + 1;
      state.selectionIndex = state.selectionIndex + 1;
    },
    setSelection: (
      state,
      action: PayloadAction<{ [position: QRCoord]: number }>
    ) => {
      state.selectedTiles = action.payload;
      state.selectionIndex = 0;
    },
    unselectTile: (state, action: PayloadAction<QRCoord>) => {
      delete state.selectedTiles[action.payload];
    },
    resetSelection: (state) => {
      state.selectionIndex = 0;
      state.selectedTiles = {};
    },
    setCurrentGame: (state, action: PayloadAction<string | null>) => {
      state.currentGame = action.payload;
    },
    newReplay: (state, action: PayloadAction<Move>) => {
      state.replay.move = action.payload;
      state.replay.playbackState = 0;
    },
    advanceReplayPlaybackState: (state) => {
      state.replay.playbackState = state.replay.playbackState + 1;
    },
    clearReplay: (state) => {
      state.replay.move = null;
      state.replay.playbackState = 0;
    }
  },
});

export const {
  selectTile,
  unselectTile,
  resetSelection,
  setCurrentGame,
  setSelection,
  newReplay,
  advanceReplayPlaybackState,
  clearReplay,
} = gameSlice.actions;

export default gameSlice.reducer;
