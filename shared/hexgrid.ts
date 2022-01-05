import {
  getRandomCharacter,
  canMakeAValidWord,
  hasTwoConsonants,
  hasAVowel,
  getMaxRepeatedLetter,
} from "./alphaHelpers";
import Cell, { makeCell } from "./cell";

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

export default interface HexGrid {
  [key: string]: Cell;
}

export const makeHexGrid = (cellMap?: { [key: string]: Cell }): HexGrid => {
  let cells: {
    [key: string]: Cell;
  } = {};
  if (cellMap) {
    cells = cellMap;
  } else {
    for (let q = -3; q <= 3; q++) {
      const rMin = QRLookup(q);
      const rMax = rMin + (q % 2 == 0 ? 6 : 5);
      for (let r = rMin; r <= rMax; r++) {
        const cell = makeCell(q, r);
        cells[`${q},${r}`] = cell;
      }
    }
  }
  return cells;
};

export const getCell = (grid: HexGrid, q: number, r: number): Cell | null => {
  return grid[`${q},${r}`];
};

export const setCell = (grid: HexGrid, cell: Cell): HexGrid => {
  grid[`${cell.q},${cell.r}`] = cell;
  return grid;
};

export const getCellNeighbors = (
  grid: HexGrid,
  q: number,
  r: number
): Cell[] => {
  const potentialNeighbors = [
    grid[`${q - 1},${r}`],
    grid[`${q - 1},${r + 1}`],
    grid[`${q},${r - 1}`],
    grid[`${q},${r + 1}`],
    grid[`${q + 1},${r - 1}`],
    grid[`${q + 1},${r}`],
  ];
  return potentialNeighbors.filter((cell) => Boolean(cell));
};

const MAX_ITERATIONS = 1000;
const MAX_REPEATED_LETTER = 4;

export const randomizeCellValue = (
  grid: HexGrid,
  q: number,
  r: number
): HexGrid => {
  const cell = getCell(grid, q, r);
  const letters = Object.values(grid)
    .filter((c) => !(c.q == q && c.r == r))
    .map((c) => c.value)
    .filter(Boolean);

  if (cell) {
    let newValue = getRandomCharacter();
    let iterations = 0;
    while (
      !hasAVowel([...letters, newValue]) ||
      !hasTwoConsonants([...letters, newValue]) ||
      getMaxRepeatedLetter([...letters, newValue]) > MAX_REPEATED_LETTER
      // This is way too slow to use in its current implementation
      // Gotta find a way to make it way faster
      // !canMakeAValidWord([...letters, newValue])
    ) {
      console.log("Invalid combo! Gotta run again");
      iterations++;
      newValue = getRandomCharacter();
      if (iterations > MAX_ITERATIONS) {
        console.error("UNABLE TO FIND VALID LETTER CONFIGURATION");
        break;
      }
    }
    cell.value = newValue;
    grid = setCell(grid, cell);
  }
  return grid;
};
