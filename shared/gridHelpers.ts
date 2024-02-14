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

/** get list of coords of cells that will become ownerless */
export const getCellsToBecomeNeutral = (
  grid: HexGrid,
  selection: HexCoord[],
  turn: number
): HexCoord[] => {
  const affected: HexCoord[] = [];
  for (const coord of selection) {
    // affected.push(coord);
    const neighbors = getCellNeighbors(grid, coord.q, coord.r);
    for (const neighbor of neighbors) {
      if (neighbor.owner !== turn && neighbor.value === "") {
        affected.push({ q: neighbor.q, r: neighbor.r });
      }
    }
  }
  return affected;
};

/** always call after updating ownership of affected cells*/
export const getCellsToBecomeBlank = (
  grid: HexGrid,
): HexCoord[] => {
  const toBecomeBlank: HexCoord[] = [];
  for (const cell of Object.values(grid)) {
    if (cell.owner === 2 && cell.value !== "") {
      const playerNeighbors = getCellNeighbors(grid, cell.q, cell.r).filter(c => c.owner !== 2);
      if (!playerNeighbors.length) {
        toBecomeBlank.push({q: cell.q, r: cell.r})
      }
    }
  }
  return toBecomeBlank;
};

/** cells that are
 * - part of the current selection, or:
 * - neighbors of cells that will be captured, which:
 *     - are owned by the enemy player (and thus don't have a value), or:
 *     - are neutral and don't have a value
 *     - (aka cells that will be reset)
 */
export const getCellsToBeReset = (
  grid: HexGrid,
  move: HexCoord[],
  turn: 0 | 1
): Cell[] => {
  const reset: Cell[] = [];
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

export const getCellsCapturedThisTurn = (
  grid: HexGrid,
  selection: HexCoord[],
  turn: number
): HexCoord[] => {
  const captured: HexCoord[] = [];
  for (const coord of selection) {
    if (willConnectToTerritory(grid, selection, coord, turn as 0 | 1)) {
      captured.push(coord);
    }
  }
  return captured;
};

export const willBecomeOwned = (
  grid: HexGrid,
  move: HexCoord[],
  turn: 0 | 1
): Cell[] => {
  const toBecomeOwned: Cell[] = [];
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
