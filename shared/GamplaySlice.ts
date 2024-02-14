import * as R from "ramda";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import HexGrid, { getCell } from "./hexgrid";
import { HexCoord } from "./types";
import { isValidWord } from "./alphaHelpers";

export interface GameplayState {
  users: string[];
  vsAI: boolean;
  gameState: "awaiting-opponent" | "pending-rng" | "playable" | "finished";
  turn: 0 | 1;
  currentGrid: HexGrid;
  winner: 0 | 1 | null;
}

// proposed
interface Gamev2 {
  version: number;
  id: string;
  gampeplayState: GameplayState;
  /** replaces moves[]
   * serialized move input data and resulting gameplaystate immer patches */
  events: {
    action: "shuffle" | "pass" | "forfeit" | "move";
    selection: HexCoord[];
    word: string | null;
    /** list of updates to apply to GameplayState
     * see https://immerjs.github.io/immer/patches */ 
    patches: {
      op: string;
      path: string[];
      value: any;
    }[];
  };
  createdDate: Date | null;
  updatedDate: Date;
  deleted: boolean;
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

type PlayerMoveAction = PayloadAction<{
  userId: string;
  move: HexCoord[];
}>;

// CQ: refactor using produce()
const makeGameplayPrimarySlice = (wordsObject: {}) =>
  createSlice({
    initialState: {} as GameplayState,
    name: "gameplay",
    reducers: {
      playerMove: (state, action: PlayerMoveAction) => {
        if (state.gameState !== "playable") {
          throw new Error("game-not-playable");
        }
        const turnUser = state.users[state.turn];
        if (action.payload.userId !== turnUser) {
          throw new Error("wrong-turn");
        }
        let word = getWord(state.currentGrid, action.payload.move);
        if (!isValidWord(word, wordsObject)) {
          throw new Error("invalid-word");
        }
        state.gameState = "pending-rng";
      },
    },
  });

type GameplaySlice = ReturnType<typeof makeGameplayPrimarySlice>;

type GameplayAction = GameplaySlice["actions"][keyof GameplaySlice["actions"]];

// export const gameplayReducer = gameplaySlice.reducer as unknown as (
//   state: GameplayState,
//   action: GameplayAction
// ) => GameplayState;
