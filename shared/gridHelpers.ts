import { HexCoord } from "./types";

import HexGrid, { getCell, getCellNeighbors } from "./hexgrid";
import Cell from "./cell";

// If you can make it to user territory that isn't in move, then its valid.
export const willConnectToTerritory = (
  grid: HexGrid,
  move: HexCoord[],
  coord: HexCoord,
  turn: 0 | 1
): boolean => {
  const stack: HexCoord[] = [coord];
  const visited: {
    [key: string]: boolean;
  } = {};
  // @ts-ignore I'm explicitly filtering out null, so idk why it thinks it can be null
  const moveCells: Cell[] = move
    .map((coord) => getCell(grid, coord.q, coord.r))
    .filter(Boolean);
  while (stack.length) {
    const current = stack.pop();
    visited[`${current?.q},${current?.r}`] = true;
    if (current != undefined && current != null) {
      const neighbors = getCellNeighbors(grid, current.q, current.r);
      const ownedNeighbors = neighbors.filter((cell) => cell.owner == turn);
      if (ownedNeighbors.length) {
        return true;
      }
      stack.push(
        ...moveCells
          .filter((c) => neighbors.find((n) => n.q == c.q && n.r == c.r))
          .filter((c) => !visited[`${c.q},${c.r}`])
      );
    }
  }
  return false;
};

export const getCellsToBeReset = (
  grid: HexGrid,
  move: HexCoord[],
  turn: 0 | 1
): Cell[] => {
  const reset = [];
  for (const coord of move) {
    const cell = getCell(grid, coord.q, coord.r);
    if (cell != null) {
      reset.push(cell);
      if (willConnectToTerritory(grid, move, coord, turn)) {
        const neighbors = getCellNeighbors(grid, cell.q, cell.r);
        for (const neighbor of neighbors) {
          if (
            neighbor.owner == (Number(!turn) as 0 | 1) ||
            (neighbor.owner == 2 && neighbor.value == "")
          ) {
            reset.push(neighbor);
          }
        }
      }
    }
  }
  return reset;
};

export const willBecomeOwned = (
  grid: HexGrid,
  move: HexCoord[],
  turn: 0 | 1
): Cell[] => {
  const toBecomeOwned = [];
  for (const coord of move) {
    const cell = getCell(grid, coord.q, coord.r);
    if (cell == null) {
      throw new Error("Invalid coords");
    }
    if (willConnectToTerritory(grid, move, coord, turn)) {
      toBecomeOwned.push(cell);
    }
  }
  return toBecomeOwned;
};
