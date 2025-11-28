import { INVALID_MOVE } from "boardgame.io/core";
import * as R from "ramda";
import { LocalBotGameState, LocalBotMove } from "./localBotSlice";
import { getWordFromMove } from "buzzwords-shared/Buzzwords";
import { isValidWord } from "buzzwords-shared/alphaHelpers";
import { WordsObject } from "../../../../server/src/words";
import { HexCoord } from "buzzwords-shared/types";
import { getCellsToBeReset, willBecomeOwned } from "buzzwords-shared/gridHelpers";
import { getCellNeighbors, setCell, getNewCellValues, getCell } from "buzzwords-shared/hexgrid";
import Cell from "buzzwords-shared/cell";
import HexGrid from "buzzwords-shared/hexgrid";

export interface PlayWordResult {
  grid: HexGrid;
  currentPlayer: 0 | 1;
  turn: number;
  gameover: boolean;
  winner: string | null;
  capitalCaptured: boolean;
  move: LocalBotMove;
}

export function processPlayWord(
  game: LocalBotGameState,
  move: HexCoord[]
): PlayWordResult | typeof INVALID_MOVE {
  const word = getWordFromMove(game, move);
  if (word === INVALID_MOVE) {
    return INVALID_MOVE;
  }
  if (!isValidWord(word, WordsObject)) {
    return INVALID_MOVE;
  }

  // Extract letters from the original grid BEFORE modifying it
  const moveLetters = move.map((coord) => {
    const cell = getCell(game.grid, coord.q, coord.r);
    return cell?.value || "";
  });

  // Clone the grid to avoid mutating the original
  const grid = R.clone(game.grid);
  const turn = game.currentPlayer;
  let capitalCaptured = false;

  // Make all tiles adjacent to move neutral and active
  const resetTiles = getCellsToBeReset(grid, move, turn);

  // Check what will become owned
  const toBecomeOwned = willBecomeOwned(grid, move, turn);

  const toBeReset = R.difference(resetTiles, toBecomeOwned);

  // Update cells that become owned
  for (const cell of toBecomeOwned) {
    const gridCell = getCell(grid, cell.q, cell.r);
    if (gridCell) {
      gridCell.owner = turn;
      if (gridCell.owner == turn) {
        gridCell.value = "";
      }
      setCell(grid, gridCell);
    }
  }

  // Get letters from cells that aren't being reset or becoming owned
  const keys = R.difference(
    R.difference(
      Object.keys(grid),
      toBeReset.map((cell) => `${cell.q},${cell.r}`)
    ),
    toBecomeOwned.map((cell) => `${cell.q},${cell.r}`)
  );

  const letters = keys.map((k) => grid[k].value).filter(Boolean);

  const opponentKeys = Object.entries(grid)
    .filter(([k, c]) => c.owner == Number(!turn))
    .map(([k, c]) => k);

  // Try to assign new cell values
  try {
    const newCellValues = getNewCellValues(
      letters,
      toBeReset.length,
      WordsObject
      // No random parameter - will use Math.random internally
    );
    for (let i = 0; i < toBeReset.length; i++) {
      const tile = toBeReset[i];
      const gridCell = getCell(grid, tile.q, tile.r);
      if (gridCell) {
        gridCell.owner = 2;
        if (gridCell.capital) {
          capitalCaptured = true;
          gridCell.capital = false;
        }
        gridCell.value = newCellValues[i];
        setCell(grid, gridCell);
      }
    }
  } catch (e) {
    // No possible combinations. Need to regenerate the whole board!!
    const newLetterCount = letters.length + toBeReset.length;
    const newCellValues = getNewCellValues(
      [],
      newLetterCount,
      WordsObject
    );
    for (const key of keys
      .map((k) => grid[k])
      .filter((k) => Boolean(k.value))) {
      const gridCell = grid[`${key.q},${key.r}`];
      if (gridCell) {
        gridCell.owner = 2;
        gridCell.value = newCellValues[0];
        newCellValues.splice(0, 1);
        setCell(grid, gridCell);
      }
    }
    for (const tile of toBeReset) {
      const gridCell = getCell(grid, tile.q, tile.r);
      if (gridCell) {
        gridCell.owner = 2;
        if (gridCell.capital) {
          capitalCaptured = true;
          gridCell.capital = false;
        }
        gridCell.value = newCellValues[0];
        newCellValues.splice(0, 1);
        setCell(grid, gridCell);
      }
    }
  }

  // Check for game over
  const gameOver =
    R.difference(
      opponentKeys,
      [...toBeReset, ...toBecomeOwned].map((c) => `${c.q},${c.r}`)
    ).length === 0;

  // Remove letters from isolated neutral cells
  for (const cell of Object.values(grid)) {
    if (cell.owner == 2) {
      const neighbors = getCellNeighbors(grid, cell.q, cell.r);
      const playerNeighbors = neighbors.filter((c) => c.owner != 2);
      if (!playerNeighbors.length) {
        cell.value = "";
        setCell(grid, cell);
      }
    }
  }

  // Check if opponent has capital, assign one if needed
  const cells = grid;
  const opponentCells: Cell[] = [];
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
  if (!capitalCaptured && !opponentHasCapital && opponentCells.length > 0) {
    const newCapital =
      opponentCells[Math.floor(Math.random() * opponentCells.length)];
    newCapital.capital = true;
    setCell(grid, newCapital);
  }

  // Determine next player and turn
  let nextPlayer: 0 | 1;
  let nextTurn: number;
  if (gameOver) {
    nextPlayer = turn; // Winner keeps their turn number
    nextTurn = game.turn;
  } else if (capitalCaptured) {
    // Bonus turn - same player continues
    nextPlayer = turn;
    nextTurn = game.turn;
  } else {
    // Normal turn change
    nextPlayer = (turn === 0 ? 1 : 0) as 0 | 1;
    nextTurn = game.turn + 1;
  }

  // Create move record
  // Store the grid state BEFORE the move (matching server pattern)
  // Note: date is stored as ISO string for Redux serializability
  const moveRecord: LocalBotMove = {
    grid: R.clone(game.grid), // Store pre-move state, not post-move
    coords: move,
    letters: moveLetters, // Use letters extracted from original grid before modifications
    player: turn,
    date: new Date().toISOString(),
  };

  return {
    grid,
    currentPlayer: nextPlayer,
    turn: nextTurn,
    gameover: gameOver,
    winner: gameOver ? String(turn) : null,
    capitalCaptured,
    move: moveRecord,
  };
}

