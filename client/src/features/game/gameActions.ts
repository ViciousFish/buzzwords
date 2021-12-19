import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppThunk } from "../../app/store";
import { QRCoord } from "../hexGrid/hexGrid";
import { selectTile, unselectTile } from "./gameSlice";
// import { getEmptyGame } from "./game";
// import { addGame } from "./gameSlice";

// export const createNewGame =
//   (userId: string): AppThunk =>
//   (dispatch) => {
//     const newGame = getEmptyGame(userId);
//     dispatch(addGame(newGame));
//   };

export const toggleTileSelected =
  (tile: QRCoord): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const selected = state.game.selectedTiles[tile] || false;
    if (selected) {
      dispatch(unselectTile(tile));
    } else {
      dispatch(selectTile(tile));
    }
  };
