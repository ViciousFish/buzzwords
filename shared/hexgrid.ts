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

/**
 * Returns the letters that should appear on the tiles about to be reset.
 *
 * Iterate over the words dictionary, finding words that
 * could be made using existing tiles on the board
 * AND the new tiles we're about to reset.
 *
 * E.g. if lettersOnTheBoard is ["c", "a"] and resetTileTotal is 2
 * we might return ["t", "z"]. The valid word being "cat". "t" completes the word
 * and "z" is filler
 */
export const getNewCellValues = (
  lettersOnTheBoard: string[],
  resetTileTotal: number,
  wordsJson: {
    [key: string]: number;
  }
): string[] => {
  if (!resetTileTotal) {
    return [];
  }

  let words = Object.keys(wordsJson);

  /**
   * Accomplishes two steps at once:
   * 1. Filter for words that could be made now, or with the introduction our reset tiles
   * 2. Determine what letters would need to be added to the board in order to make the word
   *
   * Returns an object like
   *
   * {
   *  <word>: <letters needed>[]
   * }
   */
  const wordsToMissingLetters = words.reduce((acc, word) => {
    const wordLetters = word.split("");
    for (let letter of lettersOnTheBoard) {
      const idx = wordLetters.indexOf(letter);
      if (idx != -1) {
        wordLetters.splice(idx, 1);
      }
    }
    if (wordLetters.length <= resetTileTotal) {
      acc[word] = wordLetters;
    }

    return acc;
  }, {} as { [key: string]: string[] });

  const potentialWords = Object.keys(wordsToMissingLetters);

  if (!potentialWords.length) {
    throw "No possible combinations";
  }

  const word = potentialWords[getRandomInt(0, potentialWords.length)];

  const neededLetters = wordsToMissingLetters[word];

  /**
   * If we can already make the word with letters on the board
   * Or with a less than resetTileTotal, we need "random" letters as filler.
   * This picks random characters as filler, but won't pick letters that
   * appear more than MAX_REPEATED_LETTER times.
   */
  const fillerLength = resetTileTotal - neededLetters.length;
  let filler: string[] = [];
  for (let i = 0; i < fillerLength; i++) {
    const letterCount = R.countBy(R.identity, [
      ...lettersOnTheBoard,
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
