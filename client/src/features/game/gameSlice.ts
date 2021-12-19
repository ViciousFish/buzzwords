import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HexGrid, QRCoord } from "../hexGrid/hexGrid";

interface GameState {
  selectedTiles: {
    [position: QRCoord]: boolean;
  };
}

const initialState: GameState = {
  selectedTiles: {},
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    selectTile: (state, action: PayloadAction<QRCoord>) => {
      state.selectedTiles[action.payload] = true;
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
