import * as R from "ramda";

import { getRandomCharacter } from "./alphaHelpers";
import Cell, { makeCell } from "./cell";
import { combinationN, getRandomInt, shuffle } from "./utils";

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

const MAX_REPEATED_LETTER = 3;

export const getNewCellValues = (
  grid: HexGrid,
  toBeReset: Cell[],
  toBeOwned: Cell[],
  words: {
    [key: string]: number;
  }
): string[] => {
  const keys = R.difference(
    R.difference(
      Object.keys(grid),
      toBeReset.map((cell) => `${cell.q},${cell.r}`)
    ),
    toBeOwned.map((cell) => `${cell.q},${cell.r}`)
  );
  const letters = keys.map((k) => grid[k].value).filter(Boolean);

  let w = Object.keys(words);
  let potentialWords: string[] = [];
  let combos: string[][] = [];
  if (!letters.length) {
    potentialWords = w.filter((word) => word.length <= toBeReset.length);
  } else {
    for (let i = 1; i <= letters.length; i++) {
      combos = [...combos, ...combinationN(letters, i)];
    }
    combos = shuffle(combos);

    for (let combo of combos) {
      const validWords = w.filter((word) => {
        const wordLetters = word.split("");
        for (let letter of combo) {
          const idx = wordLetters.indexOf(letter);
          if (idx == -1) {
            return false;
          }
          wordLetters.splice(idx, 1);
        }
        return wordLetters.length <= toBeReset.length;
      });
      if (!validWords.length) {
        continue;
      }
      potentialWords = validWords;
      break;
    }
  }

  const word = potentialWords[getRandomInt(0, potentialWords.length)];

  const letters2 = R.clone(letters);
  const neededLetters = [];
  for (const letter of word.split("")) {
    const idx = letters2.indexOf(letter);
    if (idx === -1) {
      neededLetters.push(letter);
      continue;
    }
    letters2.splice(idx, 1);
  }

  const fillerLength = toBeReset.length - neededLetters.length;
  let filler: string[] = [];

  for (let i = 0; i < fillerLength; i++) {
    const letterCount = R.countBy(R.identity, [
      ...letters,
      ...neededLetters,
      ...filler,
    ]);

    const omit = Object.entries(letterCount)
      .filter(([k, v]) => v >= MAX_REPEATED_LETTER)
      .map(([k, v]) => k);

    filler.push(getRandomCharacter(omit));
  }
  return shuffle([...neededLetters, ...filler]);
};
