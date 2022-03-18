import * as R from "ramda";

import { getRandomCharacter } from "./alphaHelpers";
import Cell, { makeCell } from "./cell";
import { combinationN, getRandomInt, shuffle } from "./utils";

const QRLookup: {
  small: {
    [key: string]: number;
  };
  medium: {
    [key: string]: number;
  };
  large: {
    [key: string]: number;
  };
} = {
  small: {
    "-2": -1,
    "-1": -2,
    "0": -2,
    "1": -3,
    "2": -3,
  },
  medium: {
    "-3": -1,
    "-2": -2,
    "-1": -2,
    "0": -3,
    "1": -3,
    "2": -4,
    "3": -4,
  },
  large: {
    "-4": -1,
    "-3": -2,
    "-2": -2,
    "-1": -3,
    "0": -3,
    "1": -4,
    "2": -4,
    "3": -5,
    "4": -5,
  },
};

export default interface HexGrid {
  [key: string]: Cell;
}

const boardSettings = {
  small: {
    minQ: -2,
    maxQ: 2,
    maxR: 4,
  },
  medium: {
    minQ: -3,
    maxQ: 3,
    maxR: 6,
  },
  large: {
    minQ: -4,
    maxQ: 4,
    maxR: 6,
  },
};

export const makeHexGrid = (
  size: "small" | "medium" | "large" = "medium",
  cellMap?: { [key: string]: Cell }
): HexGrid => {
  let cells: {
    [key: string]: Cell;
  } = {};
  if (cellMap) {
    cells = cellMap;
  } else {
    for (let q = boardSettings[size].minQ; q <= boardSettings[size].maxQ; q++) {
      const rMin = QRLookup[size][q.toString()];
      const rMax =
        rMin +
        (q % 2 == 0
          ? boardSettings[size].maxR
          : boardSettings[size].maxR + (size === "medium" ? -1 : 1));
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

export const getPotentialWords = (
  letters: string[],
  toBeResetLength: number,
  words: {
    [key: string]: number;
  }
): string[] => {
  let w = Object.keys(words);
  let potentialWords: string[] = [];
  let combos: string[][] = [];
  if (!letters.length) {
    potentialWords = w.filter((word) => word.length <= toBeResetLength);
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
        return wordLetters.length <= toBeResetLength;
      });
      if (!validWords.length) {
        continue;
      }
      potentialWords = validWords;
      break;
    }
    if (!potentialWords.length) {
      potentialWords = w.filter((word) => word.length <= toBeResetLength);
    }
  }
  return potentialWords;
};

export const getNewCellValues = (
  letters: string[],
  toBeReset: number,
  words: {
    [key: string]: number;
  }
): string[] => {
  if (!toBeReset) {
    return [];
  }

  let w = Object.keys(words);
  let potentialWords: string[] = [];
  let combos: string[][] = [];
  if (!letters.length) {
    potentialWords = w.filter((word) => word.length <= toBeReset);
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
        return wordLetters.length <= toBeReset;
      });
      if (!validWords.length) {
        continue;
      }
      potentialWords = validWords;
      break;
    }
    if (!potentialWords.length) {
      potentialWords = w.filter((word) => word.length <= toBeReset);
    }
  }

  if (!potentialWords.length) {
    throw "No possible combinations";
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

  const fillerLength = toBeReset - neededLetters.length;
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
