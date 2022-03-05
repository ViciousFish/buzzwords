import * as R from "ramda";

import HexGrid, { getCellNeighbors } from "./hexgrid";
import Game from "./Game";

import { permutationN, getRandomInt, combinationN, shuffle } from "./utils";
import { isValidWord } from "./alphaHelpers";
import { HexCoord } from "./types";
import Cell from "./cell";

export const getBotMove = (
  grid: HexGrid,
  options: {
    difficulty: number;
    words: {
      [key: string]: number;
    };
  }
): HexCoord[] => {
  const openTiles = Object.values(grid).filter((cell) => {
    return !cell.capital && cell.owner == 2 && cell.value != "";
  });

  const jitter = getRandomInt(-3, 4);

  // Bound max length between 3 and total open tiles
  const maxWordLength = Math.max(
    Math.min(openTiles.length, options.difficulty + jitter, 6),
    3
  );

  console.debug("Bot will try to find a word of length", maxWordLength);

  const botCapital = Object.values(grid).find((c) => c.owner == 1 && c.capital);
  if (!botCapital) {
    throw "Bot doesn't have capital on its own turn. Shouldn't be possible!";
  }
  const capitalNeighbors = shuffle(
    getCellNeighbors(grid, botCapital.q, botCapital.r).filter(
      (c) => c.owner == 2
    )
  );

  const nonCapitalNeighbors = shuffle(
    Object.values(grid)
      .filter(
        (cell) =>
          getCellNeighbors(grid, cell.q, cell.r)
            .map((c) => c.owner)
            .includes(1) &&
          cell.owner == 2 &&
          !cell.capital &&
          cell.value != ""
      )
      .filter(
        (cell) =>
          !getCellNeighbors(grid, cell.q, cell.r)
            .map((c) => c.capital && Boolean(c.owner))
            .includes(true)
      )
  );

  const capitalNeighborCoords = capitalNeighbors.map((c) => `${c.q},${c.r}`);
  const nonCapitalNeighborCoords = nonCapitalNeighbors.map(
    (c) => `${c.q},${c.r}`
  );

  const nonNeighborTiles = shuffle(
    openTiles.filter(
      (c) =>
        !capitalNeighborCoords.includes(`${c.q},${c.r}`) &&
        !nonCapitalNeighborCoords.includes(`${c.q},${c.r}`)
    )
  );

  const wordsTried: {
    [key: string]: boolean;
  } = {};
  const letterCombosTried: {
    [key: string]: boolean;
  } = {};

  let defenseTileCount = capitalNeighbors.length;
  if (getRandomInt(1, 11) > options.difficulty) {
    const defenseJitter = getRandomInt((defenseTileCount - 1) * -1, 0);
    defenseTileCount += defenseJitter;
  }

  defenseTileCount = Math.max(defenseTileCount, 0);

  const permuteAndCheck = (cells: Cell[]): HexCoord[] | null => {
    if (R.uniq(cells.map((c) => `${c.q},${c.r}`)).length != cells.length) {
      // Somehow we reused a cell. Not a valid word
      return null;
    }
    if (
      letterCombosTried[
        cells
          .map((c) => c.value)
          .sort()
          .join("")
      ]
    ) {
      return null;
    }
    for (let p of permutationN(cells, cells.length)) {
      const word = p.map((c) => c.value).join("");
      if (!wordsTried[word]) {
        if (isValidWord(word, options.words)) {
          return p.map((c) => ({
            q: c.q,
            r: c.r,
          }));
        }
      }
      wordsTried[word] = true;
    }
    letterCombosTried[
      cells
        .map((c) => c.value)
        .sort()
        .join("")
    ] = true;

    return null;
  };

  let d1 = Math.max(
    Math.min(defenseTileCount, maxWordLength),
    3 - (nonCapitalNeighbors.length + nonNeighborTiles.length)
  );
  3 - nonCapitalNeighbors.length + nonNeighborTiles.length;
  if (openTiles.length === capitalNeighbors.length) {
    // There are only capital neighbors. Make d at least 3
    d1 = Math.max(d1, 3);
  }

  for (let d = d1; d >= 0; d--) {
    if (d && d == capitalNeighbors.length && d == maxWordLength) {
      const cells = [...capitalNeighbors];
      const result = permuteAndCheck(cells);
      if (result) {
        return result;
      }
    }
    for (let neighborCells of d ? combinationN(capitalNeighbors, d) : [[]]) {
      if (d == maxWordLength) {
        const cells = [...neighborCells];
        const result = permuteAndCheck(cells);
        if (result) {
          return result;
        }
      }
      for (
        let t = Math.min(maxWordLength - d, nonCapitalNeighbors.length);
        t >= 0;
        t--
      ) {
        // Next prioritize new territory
        for (let tCombo of t ? combinationN(nonCapitalNeighbors, t) : [[]]) {
          if (d + t == maxWordLength) {
            const cells = [...neighborCells, ...tCombo];
            const result = permuteAndCheck(cells);
            if (result) {
              return result;
            }
          }
          for (
            let r = Math.min(maxWordLength - d - t, nonNeighborTiles.length);
            r >= 0;
            r--
          ) {
            for (let rCombo of r ? combinationN(nonNeighborTiles, r) : [[]]) {
              const cells = [...neighborCells, ...tCombo, ...rCombo];
              const result = permuteAndCheck(cells);
              if (result) {
                return result;
              }
            }
          }
        }
      }
    }
  }
  throw "No valid combinations! This shouldn't be possible";
};
