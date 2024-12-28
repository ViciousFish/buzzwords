// Game.ts
import type { Game as BoardGame, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import Game from "./Game";
import { nanoid } from "nanoid";
import HexGrid, {
  makeHexGrid,
  getCell,
  getCellNeighbors,
  setCell,
  getNewCellValues,
} from "buzzwords-shared/hexgrid";
import * as R from "ramda";
import { WordsObject, wordsBySortedLetters } from "../server/src/words";
import { HexCoord } from "./types";
import { isValidWord } from "./alphaHelpers";
import { getCellsToBeReset, willBecomeOwned } from "./gridHelpers";

export interface MyGameState {
  id: string;
  grid: HexGrid;
}

export const Buzzwords: BoardGame<MyGameState> = {
  name: "buzzwords",
  setup: ({ ctx, ...plugins }, setupData) => {
    const game: MyGameState = {
      id: nanoid(),
      grid: makeHexGrid(),
    };
    const neighbors = [
      ...getCellNeighbors(game.grid, -2, -1),
      ...getCellNeighbors(game.grid, 2, 1),
    ];
    const newValues = getNewCellValues([], 12, WordsObject);
    let i = 0;
    for (const cell of neighbors) {
      cell.value = newValues[i];
      i++;
      game.grid = setCell(game.grid, cell);
    }
    game.grid["-2,-1"].capital = true;
    game.grid["-2,-1"].owner = 0;
    game.grid["2,1"].capital = true;
    game.grid["2,1"].owner = 1;
    return game;
  },
  turn: {
    onEnd: ({ G, ctx, events, random, ...plugins }) => {
      // Check if the game needs to end?
      events.endGame();
    },
    maxMoves: 1,
    minMoves: 1,
  },
  maxPlayers: 2,
  minPlayers: 2,
  moves: {
    // TODO: there's gotta be a way to type the args?
    playWord: ({ G, ctx, playerID, events, random, ...plugins }, ...args) => {
      if (R.isNil(args) || args.length !== 1 || !Array.isArray(args[0])) {
        return INVALID_MOVE;
      }

      let word = "";
      for (const coord of args[0]) {
        // All we know is this is an array. Need to validate each item.
        if (!R.is(Object, coord) || !R.has("q", coord) || !R.has("r", coord)) {
          return INVALID_MOVE;
        }
        const validCoord = coord as HexCoord;

        const cell = getCell(G.grid, validCoord.q, validCoord.r);
        if (cell && cell.owner == 2 && cell.value) {
          word += cell.value;
        } else {
          return INVALID_MOVE;
        }
      }

      if (!isValidWord(word, WordsObject)) {
        return INVALID_MOVE;
      }

      // TODO: are we storing playerID as 0 or 1?
      // TODO: If not, we need to map playerID back to 0 or 1
      // TODO: or rewrite all the gridHelpers
      const turn = parseInt(playerID) as 0 | 1;
      let capitalCaptured = false;

      // Make all tiles adjacent to move neutral and active
      const resetTiles = getCellsToBeReset(G.grid, args[0], turn);

      // Parsed word, checked validity of move and word etc.
      // Have to check for what's attached to current territory to see what to expand
      // Have to check from above to see what is adjacent to enemy territory to see what to remove
      // change whose turn it is
      const toBecomeOwned = willBecomeOwned(G.grid, args[0], turn);

      const toBeReset = R.difference(resetTiles, toBecomeOwned);

      for (const cell of toBecomeOwned) {
        cell.owner = turn;
        if (cell.owner == turn) {
          cell.value = "";
        }

        setCell(G.grid, cell);
      }

      const keys = R.difference(
        R.difference(
          Object.keys(G.grid),
          toBeReset.map((cell) => `${cell.q},${cell.r}`)
        ),
        toBecomeOwned.map((cell) => `${cell.q},${cell.r}`)
      );

      const grid = G.grid;
      const letters = keys.map((k) => grid[k].value).filter(Boolean);

      const opponentKeys = Object.entries(G.grid)
        .filter(([k, c]) => c.owner == Number(!turn))
        .map(([k, c]) => k);

      const gameOver =
        R.difference(
          opponentKeys,
          [...toBeReset, ...toBecomeOwned].map((c) => `${c.q},${c.r}`)
        ).length === 0;

      if (gameOver) {
        events.endGame(playerID);
        return;
      }

      try {
        const newCellValues = getNewCellValues(
          letters,
          toBeReset.length,
          WordsObject,
          random
        );
        for (let i = 0; i < toBeReset.length; i++) {
          const tile = toBeReset[i];
          tile.owner = 2;
          if (tile.capital) {
            capitalCaptured = true;
            tile.capital = false;
          }
          tile.value = newCellValues[i];
          setCell(G.grid, tile);
        }
      } catch (e) {
        // No possible combinations. Need to regenerate the whole board!!
        const newLetterCount = letters.length + toBeReset.length;
        const newCellValues = getNewCellValues(
          [],
          newLetterCount,
          WordsObject,
          random
        );
        for (const tile of keys
          .map((k) => grid[k])
          .filter((k) => Boolean(k.value))) {
          tile.owner = 2;
          tile.value = newCellValues[0];
          newCellValues.splice(0, 1);
          setCell(G.grid, tile);
        }
        for (const tile of toBeReset) {
          tile.owner = 2;
          if (tile.capital) {
            capitalCaptured = true;
            tile.capital = false;
          }
          tile.value = newCellValues[0];
          newCellValues.splice(0, 1);
          setCell(G.grid, tile);
        }
      }

      for (const cell of Object.values(G.grid)) {
        if (cell.owner == 2) {
          const neighbors = getCellNeighbors(G.grid, cell.q, cell.r);
          const playerNeighbors = neighbors.filter((c) => c.owner != 2);
          if (!playerNeighbors.length) {
            cell.value = "";
            setCell(G.grid, cell);
          }
        }
      }

      const cells = G.grid;
      const opponentCells = [];
      let opponentHasCapital = false;
      for (const cell of Object.values(cells)) {
        if (cell.owner == Number(!turn)) {
          opponentCells.push(cell);
          if (cell.capital) {
            opponentHasCapital = true;
            break;
          }
        }
      }

      // If opponent has no capital at the end of your turn
      // but you didn't capture their capital this turn
      // randomly assign one of their cells to be capital
      if (!capitalCaptured && !opponentHasCapital) {
        const newCapital =
          opponentCells[Math.floor(random.Number() * opponentCells.length)];
        newCapital.capital = true;
        setCell(G.grid, newCapital);
      }

      // You get to go again!
      if (capitalCaptured) {
        events.endTurn({ next: playerID });
      }
    },
  },
};
