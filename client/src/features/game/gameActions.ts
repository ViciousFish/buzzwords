import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppThunk } from "../../app/store";
// import { getEmptyGame } from "./game";
import { addGame } from "./gameSlice";

// export const createNewGame =
//   (userId: string): AppThunk =>
//   (dispatch) => {
//     const newGame = getEmptyGame(userId);
//     dispatch(addGame(newGame));
//   };
