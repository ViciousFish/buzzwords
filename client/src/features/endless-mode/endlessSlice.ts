import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initEndlessGame } from "./createEndlessGame";
import { EndlessGame } from "./types";

export interface EndlessState {
  game: EndlessGame | null;
  player: {
    highScore: number;
  };
  words: string[] | null;
  wordSet: "common" | "all" | null;
}

const initialState: EndlessState = {
  game: null,
  player: {
    highScore: 0,
  },
  words: null,
  wordSet: null,
};

const endlessSlice = createSlice({
  name: "endless",
  initialState,
  reducers: {
    createEndlessGame: initEndlessGame,
    setWords: (
      state,
      action: PayloadAction<{ words: string[]; wordSet: "common" | "all" }>
    ) => {
      state.words = action.payload.words;
      state.wordSet = action.payload.wordSet;
    },
  },
});

// Export the actions and reducer
export const { actions: endlessActions, reducer } = endlessSlice;
