import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HexGrid, QRCoord } from "../hexGrid/hexGrid";

interface GameState {
  selectedTiles: {
    [position: QRCoord]: number;
  };
  selectionIndex: number;
}

const initialState: GameState = {
  selectedTiles: {},
  selectionIndex: 0,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    selectTile: (state, action: PayloadAction<QRCoord>) => {
      state.selectedTiles[action.payload] = state.selectionIndex + 1;
      state.selectionIndex = state.selectionIndex + 1;
    },
    unselectTile: (state, action: PayloadAction<QRCoord>) => {
      delete state.selectedTiles[action.payload];
    },
    resetGame: (state) => {
      Object.assign(state, initialState)
    }
  },
});

export const { selectTile, unselectTile, resetGame } = gameSlice.actions;

export default gameSlice.reducer;
