import Game from "./Game";
import HexGrid, { getCell } from "./hexgrid";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { HexCoord } from "./types";

export interface GameplayState {
  id: string;
  users: string[];
  vsAI: boolean;
  /** pending = awaiting RNG update */
  gameState: "awaiting-opponent" | "pending-rng" | "playable";
  turn: 0 | 1;
  currentGrid: HexGrid;
  gameOver: boolean;
  winner: 0 | 1 | null;
  moves: typeof gameplaySlice.actions[];
  createdDate: Date | null;
  updatedDate: Date;
  deleted: boolean;
}

const universalPreflight = (state: GameplayState, action: any) => {
  
}

function getWord(grid: HexGrid, selection: HexCoord[]) {
  let word = "";
  for (const coord of selection) {
    try {
      const cell = getCell(grid, coord.q, coord.r);
      if (cell && cell.owner == 2 && cell.value) {
        word += cell.value;
      } else {
        throw new Error("Cell in use or inactive");
      }
    } catch (e) {
      throw new Error("Invalid coords");
    }
  }
  return word;
}

// use async thunk for move??
const gameplaySlice = createSlice({
  initialState: {} as GameplayState,
  name: "gameplay",
  reducers: {
    playerMove: (state, action: PayloadAction<{
      userId: string;
      move: HexCoord[];
    }>) => {
      if (state.gameState !== 'playable') {
        throw new Error('game not in playable state')
      }
      const turnUser = state.users[state.turn]
      if (action.payload.userId !== turnUser) {
        throw new Error('not your turn')
      }
      let word = getWord(state.currentGrid, action.payload.move);
      // check validity of word?
      return state;
    },
  },
});

type GameplayAction =
  typeof gameplaySlice.actions[keyof typeof gameplaySlice.actions];

export const gameplayReducer = gameplaySlice.reducer as unknown as (
  state: GameplayState,
  action: GameplayAction
) => GameplayState;
