import { PayloadAction } from "@reduxjs/toolkit";
import { getCellNeighbors, QRLookup } from "buzzwords-shared/hexgrid";
import { max, min } from "ramda";
import { RootState } from "../../app/store";
import { EndlessState } from "./endlessSlice";
import { EndlessCell, EndlessGame } from "./types";

export function createHexagonalHexGrid(radius: number) {
  let cells: {
    [key: string]: EndlessCell;
  } = {};
  for (let q = -radius; q <= radius; q++) {
    const r1 = max(-radius, -q - radius);
    const r2 = min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const cell = {
        q,
        r,
        capital: false,
        owner: 0 as const,
        value: "",
        createdTurn: 0,
      };
      cells[`${q},${r}`] = cell;
    }
  }
  return cells;
}

export function initEndlessGame(
  state: EndlessState,
  action: PayloadAction<{
    radius: number;
    initialLetters: string[];
  }>
) {
  const grid = createHexagonalHexGrid(action.payload.radius);
  const capitalCellKey = "0,0";
  grid[capitalCellKey].capital = true;
  grid[capitalCellKey].owner = 1;

  const neighbors = getCellNeighbors(grid, 0, 0) as EndlessCell[];

  for (let i = 0; i < neighbors.length; i++) {
    const cell = neighbors[i];
    console.log("🚀 ~ neighbors ~ cell:", cell);
    cell.value = action.payload.initialLetters[i];
    grid[`${cell.q},${cell.r}`] = cell;
  }
  state.game = {
    grid,
    turn: 0,
    score: 0,
    accoladeMoves: {
      "longest-word": null,
      "final-move": null,
      "highest-scoring": null,
      "previous-move": null,
    },
  };
}
