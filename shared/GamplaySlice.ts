import * as R from "ramda";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Patch, produceWithPatches, enablePatches } from "immer";

import HexGrid, {
  getCell,
  getNewCellValues,
} from "./hexgrid";
import { HexCoord, HexCoordKey } from "./types";
import { isValidWord } from "./alphaHelpers";
import {
  getCellsCapturedThisTurn,
  getCellsToBecomeBlank,
  getCellsToBecomeNeutral,
} from "./gridHelpers";

enablePatches();

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
export const executeGameplayAction = (
  action: GameplayAction,
  _gameplayState: GameplayState,
  wordsObject: {}
): {
  event: GameplayEvent;
  nextState: GameplayState;
  inversePatches: Patch[];
} => {
  let word: string | null = null;
  const [nextState, patches, inversePatches] = produceWithPatches(
    _gameplayState,
    (draft: GameplayState) => {
      switch (action.type) {
        case "move": {
          if (draft.gameState !== "playable") {
            throw new Error("game-not-playable");
          }
          const turnUser = draft.users[draft.turn];
          if (action.payload.userId !== turnUser) {
            throw new Error("wrong-turn");
          }
          word = getWord(draft.currentGrid, action.payload.selection);
          if (!isValidWord(word, wordsObject)) {
            throw new Error("invalid-word");
          }

          //- [x] execute changes to tile ownership
          const conquered = getCellsCapturedThisTurn(
            draft.currentGrid,
            action.payload.selection,
            draft.turn
          );
          console.log('conquered', conquered);
          for (const coord of conquered) {
            const cell = draft.currentGrid[HexCoordKey(coord)];
            cell.owner = draft.turn;
            cell.value = "";
          }
          const toBecomeNeutral = getCellsToBecomeNeutral(
            draft.currentGrid,
            action.payload.selection,
            draft.turn
          );
          console.log('toBecomeNeutral', toBecomeNeutral);
          for (const coord of toBecomeNeutral) {
            const cell = draft.currentGrid[HexCoordKey(coord)];
            cell.owner = 2;
            cell.capital = false;
          }

          //- [x] remove valus from cells that no longer have playable neighbors
          const neutralToBecomeBlank = getCellsToBecomeBlank(draft.currentGrid);
          console.log('neutralToBecomeBlank', neutralToBecomeBlank);
          for (const coord of neutralToBecomeBlank) {
            draft.currentGrid[HexCoordKey(coord)].value = "";
          }

          //- [x] check win condition
          const opponentKeys = Object.values(draft.currentGrid)
            .filter((cell) => cell.owner !== draft.turn && cell.owner !== 2)
            .map(HexCoordKey);

            console.log('four')
          if (opponentKeys.length === 0) {
            // game over!
            draft.gameState = "finished";
            draft.winner = draft.turn;
            return;
          }

          //- [x] set turn to opponent
          draft.turn = Number(!draft.turn) as 0 | 1;

          //- [x] reroll capital if necessary
          if (
            !Object.values(draft.currentGrid).find(
              (cell) => cell.owner === draft.turn && cell.capital
            )
          ) {
            draft.currentGrid[
              opponentKeys[Math.floor(Math.random() * opponentKeys.length)]
            ].capital = true;
          }

          //- [-] setup board to start turn
          //  - RNG cells that need new values
          //  - reroll-if-no-playable-words routine
          const lettersOnBoard = Object.values(draft.currentGrid)
            .filter((cell) => cell.value !== "")
            .map((cell) => cell.value);
          const tilesThatNeedLetters = R.difference(
            toBecomeNeutral,
            neutralToBecomeBlank
          );
          console.log('tilesThatNeedLetters', tilesThatNeedLetters);
          try {
            const newCellValues = getNewCellValues(
              lettersOnBoard,
              tilesThatNeedLetters.length,
              wordsObject
            );
            for (let i = 0; i < tilesThatNeedLetters.length; i++) {
              const coord = tilesThatNeedLetters[i];
              const cell = draft.currentGrid[HexCoordKey(coord)];
              cell.value = newCellValues[i];
            }
          } catch (e) {
            if (e && (e as Error).message === 'no-possible-words') {
              // TODO shuffle all letter tiles
            }
          }

          // const untouchedKeys = R.difference(
          //   Object.keys(draft.currentGrid),
          //   [...toBecomeNeutral, ...conquered].map(HexCoordKey)
          // );
        }
      }
    }
  );

  return {
    event: {
      action: action.type,
      selection: action.payload.selection,
      word,
      patches,
    },
    nextState,
    inversePatches,
  };
};
