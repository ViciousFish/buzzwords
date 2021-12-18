import { Cell, getEmptyCell } from "../cell/cell";


export type QRCoord = `${number},${number}`
export interface HexGrid {
  [position: QRCoord]: Cell;
}

const QRLookup = (q: number): number => {
  switch (q) {
    case -3:
      return -1;
    case -2:
    case -1:
      return -2;
    case 0:
    case 1:
      return -3;
    case 2:
    case 3:
      return -4;

    default:
      throw new Error("invalid Q value");
  }
};

export const getCellNeighbors = (q: number, r: number, grid: HexGrid): Cell[] => {
  const potentialNeighbors = [
    grid[`${q - 1},${r}`],
    grid[`${q - 1},${r + 1}`],
    grid[`${q},${r - 1}`],
    grid[`${q},${r + 1}`],
    grid[`${q + 1},${r - 1}`],
    grid[`${q + 1},${r}`],
  ];

  return potentialNeighbors.filter((cell) => Boolean(cell));
}

export const getEmptyGrid = (): HexGrid => {
  const grid: HexGrid = {};
  for (let q = -3; q <= 3; q++) {
    const rMin = QRLookup(q);
    const rMax = rMin + (q % 2) == 0 ? 7 : 6;
    for (let r = rMin; r <= rMax; r++) {
      const cell = getEmptyCell(q, r);
      grid[`${q},${r}`] = cell;
    }
  }
  return grid
}