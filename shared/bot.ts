import HexGrid, { getCellNeighbors } from "./hexgrid";
import Game from "./Game";

import { permutationN, getRandomInt, combinationN } from "./utils";
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
    Math.min(openTiles.length, options.difficulty + jitter),
    3
  );

  console.debug("Bot will try to find a word of length", maxWordLength);

  const botCapital = Object.values(grid).find((c) => c.owner == 1 && c.capital);
  if (!botCapital) {
    throw "Bot doesn't have capital on its own turn. Shouldn't be possible!";
  }
  const capitalNeighbors = getCellNeighbors(
    grid,
    botCapital.q,
    botCapital.r
  ).filter((c) => c.owner == 2);

  const territoryNeighbors = Object.values(grid).filter(
    (cell) =>
      getCellNeighbors(grid, cell.q, cell.r)
        .map((c) => c.owner)
        .includes(1) &&
      cell.owner == 2 &&
      !cell.capital &&
      cell.value != ""
  );

  const territoryNonCapitalNeighbors = territoryNeighbors.filter(
    (cell) =>
      !getCellNeighbors(grid, cell.q, cell.r)
        .map((c) => c.capital && Boolean(c.owner))
        .includes(true)
  );

  const capitalNeighborCoords = capitalNeighbors.map((c) => `${c.q},${c.r}`);

  const nonNeighborTiles = openTiles.filter(
    (c) => !capitalNeighborCoords.includes(`${c.q},${c.r}`)
  );

  const wordsTried: {
    [key: string]: boolean;
  } = {};

  let defenseTileCount = capitalNeighbors.length;
  if (getRandomInt(1, 11) > options.difficulty) {
    const defenseJitter = getRandomInt((defenseTileCount - 1) * -1, 0);
    defenseTileCount += defenseJitter;
  }

  defenseTileCount = Math.max(defenseTileCount, 0);

  const permuteAndCheck = (cells: Cell[]): HexCoord[] | null => {
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
    return null;
  };

  for (let d = Math.min(defenseTileCount, maxWordLength); d >= 0; d--) {
    if (d && d == capitalNeighbors.length) {
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
        let t = Math.min(
          maxWordLength - d,
          territoryNonCapitalNeighbors.length
        );
        t >= 0;
        t--
      ) {
        // Next prioritize new territory
        for (let tCombo of t
          ? combinationN(territoryNonCapitalNeighbors, t)
          : [[]]) {
          if (d + t == maxWordLength) {
            const cells = [...neighborCells, ...tCombo];
            const result = permuteAndCheck(cells);
            if (result) {
              return result;
            }
          }
          for (
            let r = Math.min(maxWordLength - d - t, nonNeighborTiles.length);
            r > 0;
            r--
          ) {
            for (let rCombo of combinationN(nonNeighborTiles, r)) {
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
