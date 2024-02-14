import * as R from "ramda";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import HexGrid, { getCell } from "./hexgrid";
import { HexCoord } from "./types";
import { isValidWord } from "./alphaHelpers";
import { Patch, produceWithPatches } from "immer";

export interface GameplayState {
  users: string[];
  vsAI: boolean;
  gameState: "pending-move" | "playable" | "finished";
  turn: 0 | 1;
  currentGrid: HexGrid;
  winner: 0 | 1 | null;
}

// for serialization
interface GameplayEvent {
  action: "shuffle" | "pass" | "forfeit" | "move";
  selection: HexCoord[];
  word: string | null;
  /** list of updates to apply to GameplayState
   * see https://immerjs.github.io/immer/patches */
  patches: Patch[];
}

// proposed
interface Gamev2 {
  version: number;
  id: string;
  gampeplayState: GameplayState;
  /** replaces moves[]
   * serialized move input data and resulting gameplaystate immer patches */
  events: GameplayEvent[];
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

interface GameplayMoveAction {
  type: "move";
  payload: {
    userId: string;
    selection: HexCoord[];
  };
}

type GameplayAction = GameplayMoveAction;

/** throws gameplay errors */
const executeGameplayAction = (
  action: GameplayAction,
  gameplayState: GameplayState,
  wordsObject: {}
): GameplayEvent & { inversePatches: Patch[] } => {
  let word: string | null = null;
  const [nextState, patches, inversePatches] = produceWithPatches(gameplayState, (state: GameplayState) => {
    switch (action.type) {
      case 'move': {
        if (state.gameState !== "playable") {
          throw new Error("game-not-playable");
        }
        const turnUser = state.users[state.turn];
        if (action.payload.userId !== turnUser) {
          throw new Error("wrong-turn");
        }
        word = getWord(state.currentGrid, action.payload.selection);
        if (!isValidWord(word, wordsObject)) {
          throw new Error("invalid-word");
        }
        //- [ ] calculate cells affected by move
        //  - resetTiles, toBecomeOwned, toBeReset
        //- [ ] execute changes to tile ownership
        //- [ ] remove valus from cells that no longer have playable neighbors
        //- [ ] check win condition
        //- [ ] reroll opponent capital if necessary
        //- [ ] execute RNG
        //  - getNewCellValues
        //  - reroll-if-no-playable-words routine
      }
    }
  });

  return {
    action: action.type,
    selection: action.payload.selection,
    word,
    patches,
    inversePatches
  }
};