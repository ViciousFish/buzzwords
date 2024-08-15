import { Patch, produceWithPatches } from "immer";
import * as R from "ramda";

import { Move, ShallowGame, default as Game } from "./Game";
import HexGrid, { getCell, getNewCellValues } from "./hexgrid";
import { HexCoord, HexCoordKey } from "./types";
import { isValidWord } from "./alphaHelpers";
import {
  getCellsCapturedThisTurn,
  getCellsToBecomeBlank,
  getCellsToBecomeNeutral,
} from "./gridHelpers";
import { WordsObject } from "../server/src/words";

const prettyPatch = ({ op, path, ...patch }: Patch) => {
  const prettyPath = path.join(".");
  return {
    prettyPath,
    ...patch,
  };
};

export function makeMove(game: Game, move: HexCoord[], userId: string) {
  let word = getWord(game.grid, move);
  if (!isValidWord(word, WordsObject)) {
    throw new Error("invalid-word");
  }
  const [nextState, patches, inversePatches] = produceWithPatches(
    game,
    (draft) => moveReducer(draft, move)
  );

  console.log({
    nextState: R.omit(["grid"], nextState),
    patches: patches.map(prettyPatch),
    inversePatches: inversePatches.map(prettyPatch),
  });
  const gridDeltas = patches.filter((patch) => patch.path[0] === "grid");

  console.log({ gridDeltas: gridDeltas.map(prettyPatch) });
}

function moveReducer(game: Game, move: HexCoord[]) {
  //execute changes to tile ownership
  const conquered = getCellsCapturedThisTurn(game.grid, move, game.turn);
  for (const coord of conquered) {
    const cell = game.grid[HexCoordKey(coord)];
    cell.owner = game.turn;
    cell.value = "";
  }
  const toBecomeNeutral = getCellsToBecomeNeutral(game.grid, move, game.turn);
  for (const coord of toBecomeNeutral) {
    const cell = game.grid[HexCoordKey(coord)];
    cell.owner = 2;
    cell.capital = false;
  }

  // remove values from cells that no longer have playable neighbors
  const neutralToBecomeBlank = getCellsToBecomeBlank(game.grid);
  for (const coord of neutralToBecomeBlank) {
    game.grid[HexCoordKey(coord)].value = "";
  }

  // check win condition
  const opponentKeys = Object.values(game.grid)
    .filter((cell) => cell.owner !== game.turn && cell.owner !== 2)
    .map(HexCoordKey);

  if (opponentKeys.length === 0) {
    // game over!
    game.gameOver = true;
    game.winner = game.turn;
    return;
  }

  // set turn to opponent
  game.turn = Number(!game.turn) as 0 | 1;
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
