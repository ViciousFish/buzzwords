import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QRCoord } from "../hexGrid/hexGrid";

interface GameState {
  selectedTiles: {
    [position: QRCoord]: number;
  };
  selectionIndex: number;
  currentGame: string | null;
}

const initialState: GameState = {
  selectedTiles: {},
  selectionIndex: 0,
  currentGame: null,
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
      state.selectionIndex = 0
      state.selectedTiles = {};
    },
    setCurrentGame: (state, action: PayloadAction<string | null>) => {
      state.currentGame = action.payload;
    },
  },
});

export const {
  selectTile,
  unselectTile,
  resetSelection,
  setCurrentGame,
  setSelection,
} = gameSlice.actions;

export default gameSlice.reducer;
