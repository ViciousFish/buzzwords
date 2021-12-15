import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Game, getEmptyGame } from "./game";


interface GameState {
  gamesById: { [id: string]: Game };
}

const initialState: GameState = {
  gamesById: {}
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    createEmptyGame: (state, action: PayloadAction<{userId: string}>) => {
      const newGame = getEmptyGame(action.payload.userId)
      state.gamesById[newGame.id] = newGame
    },
    addGame: (state, action: PayloadAction<Game>) => {
      state.gamesById[action.payload.id] = action.payload
    }
  }
})

export const { createEmptyGame, addGame } = gameSlice.actions;

export default gameSlice.reducer;