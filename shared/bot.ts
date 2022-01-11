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
    return cell.owner == 2 && cell.value != "";
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

  const wordsTried: {
    [key: string]: boolean;
  } = {};

  // Try to defend the bot capital
  if (capitalNeighbors.length) {
    let defenseTileCount = capitalNeighbors.length;
    if (getRandomInt(1, 11) > options.difficulty) {
      const defenseJitter = getRandomInt((defenseTileCount - 1) * -1, 0);
      defenseTileCount += defenseJitter;
    }

    console.debug(
      "Bot has ",
      capitalNeighbors.length,
      "open cells around capital. Will try to defend ",
      defenseTileCount
    );

    const capitalNeighborCoords = capitalNeighbors.map((c) => `${c.q},${c.r}`);

    const nonNeighborTiles = openTiles.filter(
      (c) => !capitalNeighborCoords.includes(`${c.q},${c.r}`)
    );

    for (let d = defenseTileCount; d >= 1; d--) {
      for (let neighborCells of combinationN(capitalNeighbors, d)) {
        if (d == maxWordLength) {
          const cells = [...neighborCells];
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
        }
        for (let i = maxWordLength - d; i > 0; i--) {
          for (let c of combinationN(nonNeighborTiles, i)) {
            const cells = [...neighborCells, ...c];
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
          }
        }
      }
    }
  }

  for (let i = maxWordLength; i >= 3; i--) {
    for (let p of permutationN(openTiles, i)) {
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
  }
  throw "No valid combinations! This shouldn't be possible";
};
