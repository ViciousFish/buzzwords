import * as R from "ramda";

import Game from "buzzwords-shared/Game";
import { HexCoord } from "buzzwords-shared/types";
import {
  getCellsToBeReset,
  willBecomeOwned,
} from "buzzwords-shared/gridHelpers";
import { isValidWord } from "buzzwords-shared/alphaHelpers";
import { nanoid } from "nanoid";
import HexGrid, {
  makeHexGrid,
  getCell,
  getCellNeighbors,
  setCell,
  getNewCellValues,
} from "buzzwords-shared/hexgrid";

import { WordsObject, wordsBySortedLetters } from "./words";
import Cell from "buzzwords-shared/cell";
import { performance } from "perf_hooks";

export default class GameManager {
  game: Game | null;
  constructor(game: Game | null) {
    this.game = game;
  }

  makeMove(userId: string, move: HexCoord[]): Game {
    if (!this.game) {
      throw new Error("Game Manager has no game!");
    }
    if (!this.game.users.includes(userId)) {
      throw new Error("Not your game");
    }
    if (this.game.gameOver) {
      throw new Error("Game is over");
    }
    const turnUser = this.game.users[this.game.turn];
    if (userId != turnUser) {
      throw new Error("Not your turn");
    }
    if (this.game.users.length != 2) {
      throw new Error("Need another player");
    }

    let word = "";
    for (const coord of move) {
      try {
        const cell = getCell(this.game.grid, coord.q, coord.r);
        if (cell && cell.owner == 2 && cell.value) {
          word += cell.value;
        } else {
          throw new Error("Cell in use or inactive");
        }
      } catch (e) {
        throw new Error("Invalid coords");
      }
    }
    console.log("move received word", word);
    if (!isValidWord(word, WordsObject)) {
      console.log("word invalid", word);
      throw new Error("Not a valid word");
    }

    const gridCopy: { [coord: string]: Cell } = {};
    Object.keys(this.game.grid).forEach((key) => {
      const cell = this.game && this.game.grid[key];
      if (cell) {
        gridCopy[key] = R.omit(["_id"], cell);
      }
    });

    const gameMove = {
      grid: gridCopy,
      coords: move,
      letters: move.map(
        (m) => getCell(this.game?.grid as HexGrid, m.q, m.r)?.value ?? ""
      ),
      player: this.game.turn,
      date: new Date(),
    };

    let capitalCaptured = false;

    // Make all tiles adjacent to move neutral and active
    const resetTiles = getCellsToBeReset(this.game.grid, move, this.game.turn);

    // Parsed word, checked validity of move and word etc.
    // Have to check for what's attached to current territory to see what to expand
    // Have to check from above to see what is adjacent to enemy territory to see what to remove
    // change whose turn it is
    const toBecomeOwned = willBecomeOwned(this.game.grid, move, this.game.turn);

    const toBeReset = R.difference(resetTiles, toBecomeOwned);

    const getNewCellValuesTimestamp = performance.now();
    const newCellValues = getNewCellValues(
      this.game.grid,
      toBeReset,
      toBecomeOwned,
      wordsBySortedLetters
    );
    console.log(
      "getNewCellValues completed in ms",
      performance.now() - getNewCellValuesTimestamp
    );

    for (let i = 0; i < toBeReset.length; i++) {
      const tile = toBeReset[i];
      tile.owner = 2;
      if (tile.capital) {
        capitalCaptured = true;
        tile.capital = false;
      }
      tile.value = newCellValues[i];
      setCell(this.game.grid, tile);
    }

    for (const cell of toBecomeOwned) {
      cell.owner = this.game.turn;
      if (cell.owner == this.game.turn) {
        cell.value = "";
      }

      setCell(this.game.grid, cell);
    }

    for (const cell of Object.values(this.game.grid)) {
      if (cell.owner == 2) {
        const neighbors = getCellNeighbors(this.game.grid, cell.q, cell.r);
        const playerNeighbors = neighbors.filter((c) => c.owner != 2);
        if (!playerNeighbors.length) {
          cell.value = "";
          setCell(this.game.grid, cell);
        }
      }
    }

    const cells = this.game.grid;
    const opponentCells = [];
    let opponentHasCapital = false;
    for (const cell of Object.values(cells)) {
      if (cell.owner == Number(!this.game.turn)) {
        opponentCells.push(cell);
        if (cell.capital) {
          opponentHasCapital = true;
        }
      }
    }

    this.game.moves.push(gameMove);

    // GAME OVER
    if (opponentCells.length == 0) {
      this.game.gameOver = true;
      this.game.winner = this.game.turn;
      return this.game;
    }

    // If opponent has no capital at the end of your turn
    // but you didn't capture their capital this turn
    // randomly assign one of their cells to be capital
    if (!capitalCaptured && !opponentHasCapital) {
      const newCapital =
        opponentCells[Math.floor(Math.random() * opponentCells.length)];
      newCapital.capital = true;
      setCell(this.game.grid, newCapital);
    }

    const nextTurn = capitalCaptured
      ? this.game.turn
      : (Number(!this.game.turn) as 0 | 1);
    this.game.turn = nextTurn;
    return this.game;
  }

  createGame(userId: string): Game {
    const game: Game = {
      id: nanoid(),
      turn: 0 as 0 | 1,
      users: [userId],
      grid: makeHexGrid(),
      gameOver: false,
      winner: null,
      moves: [],
      vsAI: false,
      difficulty: 1,
    };
    const neighbors = [
      ...getCellNeighbors(game.grid, -2, -1),
      ...getCellNeighbors(game.grid, 2, 1),
    ];
    const newValues = getNewCellValues(
      game.grid,
      neighbors,
      [],
      wordsBySortedLetters
    );
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

    this.game = game;
    return game;
  }
}
